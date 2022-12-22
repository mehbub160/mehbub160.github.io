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
    'https://discord.com/api/webhooks/1055383889562062868/Fgre0ggknvBc6do6Kixr1FWZHY_ZcFceMbY-4FTNzeN9_dCxgtKCMDn7uWkxCsUpUiRd',
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
