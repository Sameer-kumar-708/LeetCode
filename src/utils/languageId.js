const getlanguageById = (lang) => {
  const language = {
    "c++": 105,
    java: 96,
    javascript: 102,
  };

  return language[lang.tolowerString()];
};

const submitBatch = async (submission) => {};

module.exports = getlanguageById;
