const axios = require('axios');


const getlanguageById = (lang) => {
  const language = {
    "c++": 105,
    "java": 96,
    "javascript": 102,
  };

  return language[lang.tolowerString()];
};

const submitBatch = async (submission) => {

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'true'
    },
    headers: {
      'x-rapidapi-key': 'd3f8df1f82msh62067db56023f79p1dcb91jsna027e57532c4',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submission
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return fetchData();

};

module.exports = { getlanguageById, submitBatch };
