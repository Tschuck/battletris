import { MatchInterface, UserInterface } from '@battletris/shared';
import { getRequest, postRequest } from './request';
import { getCurrentConnection } from './RoomConnection';

class User implements UserInterface {
  authToken = '';

  id = '';

  className = 'unknown';

  name = '';

  matches: MatchInterface[] = [];

  async init(battletrisId?: string) {
    const registerParams: {
      battletris_id?: string;
      exportAuthToken: boolean;
    } = {
      exportAuthToken: true,
    };
    if (battletrisId) {
      registerParams.battletris_id = battletrisId;
    }

    // ensure connection id
    const { id, authToken } = await postRequest('register', registerParams);
    // request user info
    const user = await getRequest('user');
    this.id = id;
    this.authToken = authToken;
    this.className = user.className;
    this.matches = user.matches;
    this.name = user.name;
  }

  async update(name: string, className: string) {
    const roomConnection = getCurrentConnection();
    await postRequest('user', {
      className,
      name,
      roomId: roomConnection?.roomId,
    });
    this.name = name;
    this.className = className;
  }

  async export() {
    // request register again and export signed token
    const { authToken } = await postRequest('register', {
      exportAuthToken: true,
    });
    const dataStr = `data:text/json;charset=utf-8, ${encodeURIComponent(
      JSON.stringify({ id: authToken }),
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

    return new Promise<void>((resole, reject) => {
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
