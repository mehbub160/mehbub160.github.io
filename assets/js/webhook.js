const form = document.getElementById('emailForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.elements['name'].value;
  const email = form.elements['email'].value;
  const subject = form.elements['subject'].value;
  const message = form.elements['message'].value;

  const content = `Name: ${name}\n\nEmail: ${email}\n\nSubject: ${subject}\n\nMessage: ${message}`;

  const formBody = {
    content,
    embeds: null,
    attachments: []
  };

 fetch("https://discord.com/api/v10/webhooks/1342096332432736328/FBZdrk7651RKueOd8-qjgYWM5HCGxa2Oc1nCz5xLq3WRYweWzDKIwJOZZ6RAC-b-W51l?wait=true", {
  "headers": {
    "accept": "application/json",
    "accept-language": "en",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site"
  },
  "referrer": "https://discohook.org/",
  "referrerPolicy": "strict-origin",
  "body": JSON.stringify(formBody),
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
})
    .then(() => {
      alert('Email sent successfully');
      form.reset();
    })
    .catch((e) => {
      alert('Could not send email');
    });
});
