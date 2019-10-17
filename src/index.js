const child_process = require('child_process');
const axios = require('axios');

const cmd = 'sudo /usr/local/bin/arp-scan -l --interface en0';

child_process.exec(cmd, async (err, stdout) => {
  const stdoutLines = stdout.split('\t');
  const macAdressLines = stdoutLines.filter(ele => {
    return /[0-9a-f]{2}(:[0-9a-f]{2}){5}/.test(ele);
  });
  const res = await axios.get(
    'https://scrapbox.io/api/pages/masuilab-dareiru/macaddress',
  );
  const knownMacAdressData = res.data.lines
    .map(ele => ele.text)
    .filter(ele => {
      return /^\$/.test(ele);
    })
    .map(ele => {
      return { mac: ele.split(' ')[1], name: ele.split(' ')[2] };
    });
  const existingMacAdress = knownMacAdressData.filter(ele => {
    return macAdressLines.includes(ele.mac);
  });
  let tuple;
  if (existingMacAdress.find(ele => ele.name === 'saji')) {
    tuple = {
      name: 'isInLab',
      value: true,
    };
  } else {
    tuple = {
      name: 'isInLab',
      value: false,
    };
  }
  const writeOperation = {
    _payload: tuple,
    _where: 'saji',
    _type: 'write',
  };
  await axios.post('http://new-linda.herokuapp.com', writeOperation);
});
