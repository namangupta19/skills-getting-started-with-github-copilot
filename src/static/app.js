document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const participantsList = document.getElementById("participants-list");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Main details (use innerHTML for static content)
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section (build with DOM methods for safety)
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsSection.appendChild(participantsHeading);

        const participants = Array.isArray(details.participants) ? details.participants : [];

        if (participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            // Use textContent to avoid injecting HTML
            li.textContent = p;

            // Create delete icon
            const deleteIcon = document.createElement("span");
            deleteIcon.textContent = "🗑️"; // You can replace this with an actual icon
            deleteIcon.style.cursor = "pointer";
            deleteIcon.addEventListener("click", () => unregisterParticipant(p, activityCard));

            li.appendChild(deleteIcon);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const noP = document.createElement("p");
          noP.className = "no-participants";
          noP.textContent = "No participants yet. Be the first to sign up!";
          participantsSection.appendChild(noP);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Refresh the participants list after registration
  async function refreshParticipants() {
    const response = await fetch('/participants');
    const participants = await response.json();
    participantsList.innerHTML = '';
    participants.forEach(participant => {
      const li = document.createElement('li');
      li.textContent = participant.name;
      participantsList.appendChild(li);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await refreshParticipants(); // Refresh participants list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  function unregisterParticipant(email, activityCard) {
    // Logic to unregister participant
    console.log(`Unregistering participant: ${email}`);

    // Find the activity card for the participant
    const card = Array.from(activitiesList.children).find((card) => {
      const activityName = card.querySelector("h4").textContent;
      return activityName === activityCard.querySelector("h4").textContent;
    });

    if (card) {
      const participantsSection = card.querySelector(".participants-section");
      const participantsList = participantsSection.querySelector(".participants-list");

      // Find and remove the participant list item
      const participantItem = Array.from(participantsList.children).find((item) => {
        return item.textContent.includes(email);
      });

      if (participantItem) {
        participantsList.removeChild(participantItem);
        messageDiv.textContent = `${email} has been unregistered.`;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");

        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      }
    }
  }

  // CSS to hide bullet points
  const style = document.createElement('style');
  style.innerHTML = `
    #participants-list {
      list-style-type: none;
      padding: 0;
    }
  `;
  document.head.appendChild(style);

  // Initialize app
  fetchActivities();
});
