// feedback.js

let feedbackSocket = null;

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  const alertBox = document.getElementById('feedbackAlert');

  // Use the same WebSocket connection as the app if available
  if (typeof socket !== 'undefined') {
    feedbackSocket = socket;
  } else {
    feedbackSocket = new WebSocket('wss://ws.yourtake.org:443/ws');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('feedbackEmail').value.trim();
    const feedback = document.getElementById('feedbackText').value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alertBox.innerHTML = '<div class="alert alert-warning">Please enter a valid email address.</div>';
      return;
    }

    if (!feedback) {
      alertBox.innerHTML = '<div class="alert alert-warning">Feedback cannot be empty.</div>';
      return;
    }

    const payload = {
      type: 'FEEDBACK',
      email: email,
      feedback_text: feedback
    };

    if (feedbackSocket && feedbackSocket.readyState === WebSocket.OPEN) {
      feedbackSocket.send(JSON.stringify(payload));
      alertBox.innerHTML = '<div class="alert alert-success">Thank you for your feedback! Our support team will respond to this via email shortly</div>';
      form.reset();
    } else {
      alertBox.innerHTML = '<div class="alert alert-danger">Unable to submit feedback. Please try again later.</div>';
    }
  });
});
