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
    'https://discord.com/api/webhooks/1342096332432736328/FBZdrk7651RKueOd8-qjgYWM5HCGxa2Oc1nCz5xLq3WRYweWzDKIwJOZZ6RAC-b-W51l',
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
      alert('Email sent successfully');
      form.reset();
    })
    .catch((e) => {
      alert('Could not send email');
    });
});
