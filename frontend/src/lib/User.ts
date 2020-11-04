import axios from 'axios';

import config from '../config';

class User {
  connectionId = '';

  className = 'unknown';

  name = '';

  matches: string[] = [];

  async init(battletrisId?: string) {
    const registerParams: { battletris_id?: string } = {};
    if (battletrisId) {
      registerParams.battletris_id = battletrisId;
    }

    // ensure connection id
    const { data: { id } } = await axios.get(`${config.serverUrl}/register`, {
      withCredentials: true,
      params: registerParams,
    });
    // request user info
    const { data } = await axios.get(`${config.serverUrl}/user`, { withCredentials: true });
    this.connectionId = id;
    this.className = data.className;
    this.matches = data.matches;
    this.name = data.name;
  }

  async exportConnectionId() {
    const {
      data: { id: connectionId },
    } = await axios.get(`${config.serverUrl}/register`, {
      withCredentials: true,
    });

    const dataStr = `data:text/json;charset=utf-8, ${encodeURIComponent(
      JSON.stringify({ connectionId }),
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `battletris_id.${this.name}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  async importConnectionId(fileInput: { files: Blob[] }) {
    const reader = new FileReader();

    return new Promise((resole, reject) => {
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event?.target?.result as string);
          if (!imported.connectionId) {
            throw new Error('invalid json');
          }

          await this.init(imported.connectionId);
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
