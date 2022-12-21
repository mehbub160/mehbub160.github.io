const form = document.getElementById('emailForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.elements['name'].value;
  const email = form.elements['email'].value;
  const subject = form.elements['subject'].value;
  const message = form.elements['message'].value;

  const formBody =
    '{"content":"Name: ' +
    name +
    '\\n\\nemail: ' +
    email +
    '\\n\\nsubject: ' +
    subject +
    '\\n\\nmessage:\\n ' +
    message.replaceAll('\n', '\\n') +
    '","embeds":null,"attachments":[]}';

  fetch(
    'https://discord.com/api/v10/webhooks/1051893959431049317/oPkWTpmwtcmW3Jmn-bI5I_L4qEaIGlgBIIDqZiPDqIKxMectcohT4G18FaihX02lg9AS?wait=true',
    {
      headers: {
        accept: 'application/json',
        'accept-language': 'en',
        'content-type': 'application/json',
        'sec-ch-ua':
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
      },
      referrer: 'https://discohook.org/',
      referrerPolicy: 'strict-origin',
      body: formBody,
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
    }
  )
    .then(() => {
      alert('Email sent succeaafully');
    })
    .catch((e) => {
      alert('Could not send email');
    });
});
