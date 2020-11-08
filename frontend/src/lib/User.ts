import { getRequest, postRequest } from './request';
import { getCurrentConnection, WsMessageType } from './RoomConnection';

class User {
  userId = '';

  className = 'unknown';

  name = '';

  matches: string[] = [];

  async init(battletrisId?: string) {
    const registerParams: { battletris_id?: string } = {};
    if (battletrisId) {
      registerParams.battletris_id = battletrisId;
    }

    // ensure connection id
    const { id } = await postRequest('register', registerParams);
    // request user info
    const user = await getRequest('user');
    this.userId = id;
    this.className = user.className;
    this.matches = user.matches;
    this.name = user.name;
  }

  async update(name: string, className: string) {
    await postRequest('user', { className, name });
    this.name = name;
    this.className = className;

    // update user data also for others
    const roomConnection = getCurrentConnection();
    if (roomConnection) {
      roomConnection.send(WsMessageType.USER_UPDATE, { className, name });
    }
  }

  async export() {
    const dataStr = `data:text/json;charset=utf-8, ${encodeURIComponent(
      JSON.stringify({ id: this.userId }),
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `battletris_id.${this.name}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  async import(fileInput: { files: Blob[] }) {
    const reader = new FileReader();

    return new Promise((resole, reject) => {
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event?.target?.result as string);
          if (!imported.id) {
            throw new Error('invalid json');
          }

          await this.init(imported.id);
          resole();
        } catch (ex) {
          reject(ex);
        }
      };

      reader.readAsText(fileInput.files[0]);
    });
  }
}

export default new User();
