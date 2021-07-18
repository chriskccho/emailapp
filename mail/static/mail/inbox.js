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

  document.querySelector('#compose-form').onsubmit = function() {
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
      
      // eachEmail.addEventListener('click', function() {
      //   var emailId = emails[i].id;
      //   fetch(`/emails/${emailId}`)
      //   .then(response => response.json())
      //   .then(email =>  {
      //     var infoContainer = document.createElement('div');
      //     infoContainer.setAttribute('class','info-container');
      //     infoContainer.append(email.sender)
      //     infoContainer.append(email.recipients)
      //     infoContainer.append(email.subject)
      //     infoContainer.append(email.timestamp)
      //     document.querySelector('#emails-view').style.display = 'none';
      //     document.querySelector('#specific-email-view').style.display = 'block';
      //     document.querySelector('#specific-email-view').append(infoContainer);
      //   });
      //   history.pushState({mailbox:mailbox},'',`emails${emailId}`);
        //history.pushState({mailbox:mailbox},'',`emails${emailId}`);

      //});
      // eachEmail.addEventListener('click', function() {
      //   emailclick(emails[i],mailbox);
      // });
      
      eachEmail.append(sender);
      eachEmail.append(subject);
      eachEmail.append(timestamp);
      eachEmail.addEventListener('click', () => emailclick(emails[i]));
      document.querySelector('#emails-view').append(eachEmail)
    }
    
  });
  
}

function emailclick(oneemail) {
  var emailId = oneemail.id;
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email =>  {
    var infoContainer = document.createElement('div');
    infoContainer.setAttribute('class','info-container');
    infoContainer.append(email.sender)
    infoContainer.append(email.recipients)
    infoContainer.append(email.subject)
    infoContainer.append(email.timestamp)
    document.querySelector('#specific-email-view').append(infoContainer);
  });
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#specific-email-view').style.display = 'block';
  //document.querySelector('#specific-email-view').append(infoContainer);

}