const fs = require("fs");
exports.removeSpecialChars = function (str) {
  return str
    .replace(/(?!\w|\s)./g, "")
    .replace(/\s+/g, "")
    .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, "$2");
};

exports.setNumbers = async (number) => {
  return new Promise(async (resolve, ejt) => {
    await fs.writeFileSync(
      `${__dirname}/data.json`,
      JSON.stringify({ number }),
      (er) => {
        if (er) ejt(er);
        resolve(true);
      }
    );
  });
};

exports.getNumbers = () => {
  return new Promise(async (resolve, ejt) => {
    try {
      const { number } = require(`${__dirname}/data.json`);
      resolve(number);
    } catch (error) {
      await fs.writeFileSync(
        `${__dirname}/data.json`,
        JSON.stringify({ number: 0 }),
        (er) => {
          if (er) ejt(er);
          resolve(0);
        }
      );
    }
  });
};
