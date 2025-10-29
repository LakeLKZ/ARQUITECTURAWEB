const fs = require('fs-extra');
const path = require('path');

class FileManager {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
  }

  async readFile(filename) {
    try {
      const filePath = path.join(this.dataPath, `${filename}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async writeFile(filename, data) {
    try {
      const filePath = path.join(this.dataPath, `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }

  getNextId(array) {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map(item => item.id)) + 1;
  }

  async createBackup(filename) {
    try {
      const sourcePath = path.join(this.dataPath, `${filename}.json`);
      const backupPath = path.join(this.dataPath, `${filename}_backup_${Date.now()}.json`);
      await fs.copy(sourcePath, backupPath);
    } catch (error) {
    }
  }
}

module.exports = new FileManager();