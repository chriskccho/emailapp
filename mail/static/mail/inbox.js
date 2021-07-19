window.addEventListener('popstate', e=> {
  console.log(e.state);
  load_mailbox(e.state.mailbox);
});

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = submitform;

}

function submitform() {
  const reci = document.querySelector('#compose-recipients').value
  const subj = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value
  fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: reci,
      subject: subj,
      body: body
    }),
  })
  .then(response => response.json())
  .then(result => {
    if(result.hasOwnProperty('error')) {
      alert(result.error);
    }
    else {
      alert(result.message);
    }

  });
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-body').value = '';
  localStorage.clear();
  return false; 
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#specific-email-view').innerHTML = '';
  document.querySelector('#specific-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    for (let i = 0; i < emails.length; i++) {
      var sender = document.createElement('div');
      sender.setAttribute('class','component sender');
      sender.innerHTML = `${emails[i].sender}`;
      var subject = document.createElement('div');
      subject.setAttribute('class','component')
      subject.innerHTML = `${emails[i].subject}`;
      var timestamp = document.createElement('div');
      timestamp.setAttribute('class','component time');
      timestamp.innerHTML = `${emails[i].timestamp}`;
      var eachEmail = document.createElement('div');
      eachEmail.setAttribute('class','each-email');
      if (mailbox !== 'sent') {
        var button = document.createElement('button');
        button.setAttribute('class','archive-btn');
        button.innerHTML = 'Archive';
        if (mailbox === 'archive') {
          button.innerHTML = 'Unarchive'
        }
        button.addEventListener('click', () => emailarchive(emails[i]));
        eachEmail.append(button);
      }
      eachEmail.append(sender);
      eachEmail.append(subject);
      eachEmail.append(timestamp);
      
      
      sender.addEventListener('click', () => emailclick(emails[i]));
      subject.addEventListener('click', () => emailclick(emails[i]));
      timestamp.addEventListener('click', () => emailclick(emails[i]));

      sender.addEventListener('click', () => emailread(emails[i]));
      subject.addEventListener('click', () => emailread(emails[i]));
      timestamp.addEventListener('click', () => emailread(emails[i]));

      //console.log(emails[i].archived)
      if (emails[i].read == true) {
        eachEmail.style.backgroundColor = 'lightgrey';
      }
      
      //console.log(eachEmail);
      document.querySelector('#emails-view').append(eachEmail)
    }
    
  });
  
}

function emailread(oneemail) {
  var emailId = oneemail.id;
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body:JSON.stringify({
      read:true
    })
  })
  
}

function emailarchive(oneemail) {
  var emailId = oneemail.id;  
  if (oneemail.archived === false) {
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived:true
      })
    })
  } else if (oneemail.archived === true) {
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived:false
      })
    })
  }

  location.reload();
}

function emailclick(oneemail) {
  var emailId = oneemail.id;
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email =>  {
    var infoContainer = document.createElement('div');
    infoContainer.setAttribute('class','info-container');
    var body = email.body.split('\n').join('<br/>');
    infoContainer.innerHTML = `
    <h5>${email.subject}</h5>
    <p>From: ${email.sender}</p>
    <p>To: ${email.recipients}</p>
    <p>When: ${email.timestamp}</p>
    <hr>
    <p>${body}</p>`;
    var replybutton = document.createElement('button');
    replybutton.innerHTML = 'Reply';
    document.querySelector('#specific-email-view').append(infoContainer);
    document.querySelector('#specific-email-view').append(replybutton);
    replybutton.addEventListener('click', () => emailreply(oneemail));
  });
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#specific-email-view').style.display = 'block';

  console.log(oneemail);

}

function emailreply(oneemail) {
   // Show compose view and hide other views
   document.querySelector('#specific-email-view').style.display = 'none';
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#compose-view').style.display = 'block';
 
   // Clear out composition fields
   document.querySelector('#compose-recipients').value = oneemail.sender;

   if (!(oneemail.subject.startsWith('RE:'))) {
     document.querySelector('#compose-subject').value = `RE: ${oneemail.subject}`;
   } else {
     document.querySelector('#compose-subject').value = oneemail.subject;
   }

   document.querySelector('#compose-body').value = `\n\n\n\nOn ${oneemail.timestamp} <${oneemail.sender}> wrote: \n${oneemail.body}`;
   
   document.querySelector('#compose-form').onsubmit = submitform;
}