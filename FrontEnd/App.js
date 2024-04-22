import 'bootstrap/dist/css/bootstrap.min.css';

// Document ready function
document.addEventListener('DOMContentLoaded', function () {
    console.log("Initializing application...");
    console.log("Checking if element exists:", document.getElementById('editEmployeeName'));


    // Set default form values
    initializeFormDefaults();

    // Attach all event listeners
    attachEventListeners();

    // Fetch and display all employees on load
    fetchAllEmployees();
});

// Function Checklist and Outline

// initializeFormDefaults()
// Sets default values for form inputs upon page load.
// Example fields to set: newEmployeeName, newEmployeeEmail, etc.
function initializeFormDefaults() {
  console.log("Setting default form values...");
  document.getElementById('newEmployeeName').value = 'John Doe';
  document.getElementById('newEmployeeEmail').value = 'johndoe@example.com';
  document.getElementById('newEmployeeIsMentor').checked = false;
  document.getElementById('newEmployeeUsername').value = 'john.doe';
  document.getElementById('newEmployeePassword').value = 'securepassword123';
  document.getElementById('newEmployeeEmploymentType').value = 'Part-time';
}

// attachEventListeners()
// Attaches all necessary event listeners when the document is ready.
// Includes listeners for form submissions and interactive elements like buttons.
function attachEventListeners() {
  console.log("Attaching event listeners...");
  document.getElementById('newEmployeeIsMentor').addEventListener('change', handleMentorChange);
  document.getElementById('newEmployeeModal').addEventListener('submit', handleSubmitEmployee);
  document.getElementById('editEmployeeForm').addEventListener('submit', handleSubmitEmployee);
  document.getElementById('employeeTable').addEventListener('click', handleTableClick);
  // Modal related listeners
  document.getElementById('deleteEmployeeModal').addEventListener('show.bs.modal', function (event) {
      // Button that triggered the modal
      var button = event.relatedTarget;
      // Extract info from data-* attributes
      var employeeId = button.getAttribute('data-employee-id');
      // Set action for confirm delete button
      document.getElementById('confirmDelete').onclick = function () {
          deleteEmployee(employeeId);
      };
  });
  document.getElementById('deleteEmployeeModal').addEventListener('hidden.bs.modal', function () {
      this.removeAttribute('data-employee-id');
  });
}


// handleMentorChange()
// Handles changes to the 'Mentor' checkbox to dynamically update related form fields.
// Adjusts form fields to either show mentor or mentee options based on the checkbox state.
  function handleMentorChange() {
  console.log("Handling mentor change...");
  const isMentor = document.getElementById('newEmployeeIsMentor').checked;
  console.log("Is Mentor Checked: ", isMentor);
  const assignmentsDropdown = document.getElementById('newMentorAssignments');

  assignmentsDropdown.innerHTML = ''; // Clear existing options
  if (isMentor) {
    // Populate with mentees if this new employee is a mentor
    fetchMentees().then(mentees => {
      console.log("Fetched Mentees: ", mentees);
      mentees.forEach(mentee => {
        const option = new Option(mentee.name, mentee.employeeId);
        assignmentsDropdown.appendChild(option);
      });
    }).catch(error => console.error('Error fetching mentees:', error));
  } else {
    // Populate with mentors if this new employee is a mentee
    fetchMentors().then(mentors => {
      console.log("Fetched Mentors: ", mentors);
      mentors.forEach(mentor => {
        const option = new Option(mentor.name, mentor.employeeId);
        assignmentsDropdown.appendChild(option);
      });
    }).catch(error => console.error('Error fetching mentors:', error));
  }
}

// // handleNewEmployeeSubmit(event)
// // Handles the submission of the 'New Employee' form.
// // Prevents default form submission, collects form data, and calls createEmployee.
// function handleNewEmployeeSubmit(event) {
//   event.preventDefault();
//   console.log("Form submit triggered");

//   const formData = {
//       name: document.getElementById('newEmployeeName').value,
//       email: document.getElementById('newEmployeeEmail').value,
//       isMentor: document.getElementById('newEmployeeIsMentor').checked,
//       username: document.getElementById('newEmployeeUsername').value,
//       password: document.getElementById('newEmployeePassword').value,
//       employmentType: document.getElementById('newEmployeeEmploymentType').value,
//       mentor: document.getElementById('newMentorAssignments').value,
//       mentee: document.getElementById('newMenteeAssignments').value
//   };

//   console.log("Form Data:", formData);
//   createEmployee(formData);  // Ensure this function logs and functions correctly
// }
// // handleEditEmployeeSubmit(event)
// // Manages form submission for editing an employee's details.
// // Gathers updated data from the form and invokes updateEmployee.
// function handleEditEmployeeSubmit(event) {
//   event.preventDefault();
//   console.log("Edit form submission triggered");

//   // Collect form data
//   const formData = {
//     employeeId: document.getElementById('editEmployeeId').value,
//     name: document.getElementById('editName').value,
//     email: document.getElementById('editEmail').value, // Assuming you have added an email field
//     isMentor: document.getElementById('editIsMentor').checked,
//     username: document.getElementById('editUsername').value, // Assuming you have added a username field
//     password: document.getElementById('editPassword').value, // Assuming you have added a password field
//     employmentType: document.getElementById('editEmploymentType').value,
//     mentor: document.getElementById('editMentorAssignments').value, // Assuming you have a mentor assignment dropdown
//     mentee: document.getElementById('editMenteeAssignments').value // Assuming you have a mentee assignment dropdown
//   };

//   console.log("Updated employee data:", formData);
//   updateEmployee(formData.employeeId, formData);
// }

// Function to handle form submission for both creating and updating employees
function handleSubmitEmployee(event) {
  event.preventDefault();
  const formId = event.target.id; // Get the ID of the form to determine if it's 'addEmployeeForm' or 'editEmployeeForm'
  const isEdit = formId === 'editEmployeeForm';
  
  // Prepare data
  const employeeData = prepareEmployeeData(isEdit);
  
  if (!employeeData) {
    console.error("Required elements not found.");
    return;
  }

  const url = isEdit ? `http://localhost:8080/newhireinfo/${employeeData.employeeId}` : 'http://localhost:8080/newhireinfo';
  const method = isEdit ? 'PUT' : 'POST';

  // Send data to the server using fetch API
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(employeeData)
  })
  // handle response
}


function prepareEmployeeData(isEdit) {
  const suffix = isEdit ? 'edit' : 'new';
  const nameEl = document.getElementById(`${suffix}EmployeeName`);
  const emailEl = document.getElementById(`${suffix}EmployeeEmail`);
  const isMentorEl = document.getElementById(`${suffix}EmployeeIsMentor`);
  const usernameEl = document.getElementById(`${suffix}EmployeeUsername`);
  const passwordEl = document.getElementById(`${suffix}EmployeePassword`);
  const employmentTypeEl = document.getElementById(`${suffix}EmployeeEmploymentType`);
  const mentorEl = document.getElementById(`${suffix}MentorAssignments`);
  const menteeEl = document.getElementById(`${suffix}MenteeAssignments`);

  if (!nameEl || !emailEl || !isMentorEl || !usernameEl || !passwordEl || !employmentTypeEl || !mentorEl || !menteeEl) {
    return null; // Return null if any element is not found
  }

  return {
    name: nameEl.value,
    email: emailEl.value,
    isMentor: isMentorEl.checked,
    username: usernameEl.value,
    password: passwordEl.value,
    employmentType: employmentTypeEl.value,
    mentor: mentorEl.value,
    mentee: menteeEl.value
  };
}

// handleTableClick(event)
// Deals with click events on the employee table, distinguishing between view, edit, and archive actions based on button classes.
// Calls respective functions like viewEmployee, editEmployee, or archiveEmployee.
function handleTableClick(event) {
  const employeeId = event.target.closest('tr').getAttribute('data-employee-id');
  if (event.target.classList.contains('view-btn')) {
      viewEmployee(employeeId);
  } else if (event.target.classList.contains('edit-btn')) {
      editEmployee(employeeId);
  } else if (event.target.classList.contains('delete-btn')) {
      const deleteModal = document.getElementById('deleteEmployeeModal');
      deleteModal.setAttribute('data-employee-id', employeeId);
      new bootstrap.Modal(deleteModal).show();
  }
}

// fetchAllEmployees()
// Fetches and displays all employees from the server.
// Populates the employee table with fetched data.
function fetchAllEmployees() {
  console.log("Fetching all employees...");
  fetch('http://localhost:8080/newhireinfo')
  console.log("Fetching all employees...");
  fetch('http://localhost:8080/newhireinfo')
      .then(response => response.json())
      .then(employees => {
          const employeeTableBody = document.getElementById('employeeData');
          employeeTableBody.innerHTML = '';
          employees.forEach(employee => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${employee.employeeId}</td>
                  <td>${employee.name}</td>
                  <td>${employee.employmentType}</td>
                  <td>${employee.isMentor ? 'Yes' : 'No'}</td>
                  <td>
                      <button class="btn btn-success" onclick="viewEmployee(${employee.employeeId})"><i class="bi bi-eye"></i></button>
                      <button class="btn btn-primary" onclick="editEmployee(${employee.employeeId})"><i class="bi bi-pencil-square"></i></button>
                      // <button class="btn btn-danger" onclick="archiveEmployee(${employee.employeeId})"><i class="bi bi-trash"></i></button>
                      <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteEmployeeModal" data-employee-id="${employee.employeeId}"><i class="bi bi-trash"></i></button>
                  </td>
              `;
              employeeTableBody.appendChild(row);
          });
      })
      .catch(error => {
          console.error('Error fetching employees:', error);
      });
}


// createEmployee(formData)
// Sends a request to the server to create a new employee with provided form data.
// Handles server response and updates UI accordingly (refreshes employee list, etc.).
function createEmployee(employeeData) {
  // Get values from the form
  const isMentor = document.getElementById('newEmployeeIsMentor').checked;
  const mentorSelect = document.getElementById('mentorSelect');
    if (mentorSelect) {
      employeeData.mentor = mentorSelect.value;
    } else {
      console.error('Mentor select box not found');
    }
  const menteeSelect = document.getElementById('menteeSelect');

  // Set mentor or mentee ID based on the role of the new hire
  if (isMentor && menteeSelect) {
    employeeData.mentee = menteeSelect.value; // New hire is a mentor and assigns a mentee
  } else if (!isMentor && mentorSelect) {
    employeeData.mentor = mentorSelect.value; // New hire is a mentee and assigns a mentor
  }
  console.log("Sending data to server for new employee creation:", employeeData);
  fetch('http://localhost:8080/newhireinfo', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
  })
  .then(response => {
      body: JSON.stringify(employeeData)
  })
  .then(response => {
      if (response.ok) {
          onsole.log("Employee created successfully with ID:", data.employeeId);
          fetchAllEmployees(); // Refresh the employee list
          document.getElementById('newEmployeeForm').reset(); // Reset the form
          $('#newEmployeeModal').modal('hide'); // Close the modal
          onsole.log("Employee created successfully with ID:", data.employeeId);
          fetchAllEmployees(); // Refresh the employee list
          document.getElementById('newEmployeeForm').reset(); // Reset the form
          $('#newEmployeeModal').modal('hide'); // Close the modal
      } else {
          response.json().then(data => {
              console.log('Failed to create employee:', data.message);
              alert('Failed to create employee: ' + data.message);
          });
          response.json().then(data => {
              console.log('Failed to create employee:', data.message);
              alert('Failed to create employee: ' + data.message);
          });
      }
  })
  .catch(error => console.error('Error creating employee:', error));
}

// viewEmployee(employeeId)
// Fetches detailed information about a specific employee for viewing.
// Displays employee details in a modal or dedicated view section.
  })
  .catch(error => console.error('Error creating employee:', error));
}

// viewEmployee(employeeId)
// Fetches detailed information about a specific employee for viewing.
// Displays employee details in a modal or dedicated view section.
function viewEmployee(employeeId) {
  console.log(`Viewing employee with ID: ${employeeId}`);
  fetch(`http://localhost:8080/newhireinfo/${employeeId}`)
      .then(response => response.json())
      .then(employee => {
          // Populate the view modal with the employee's details
          document.getElementById('viewEmployeeId').textContent = employee.employeeId;
          document.getElementById('viewName').textContent = employee.name;
          document.getElementById('viewIsMentor').textContent = employee.isMentor;
          document.getElementById('viewEmploymentType').textContent = employee.employmentType;
      .then(response => response.json())
      .then(employee => {
          // Populate the view modal with the employee's details
          document.getElementById('viewEmployeeId').textContent = employee.employeeId;
          document.getElementById('viewName').textContent = employee.name;
          document.getElementById('viewIsMentor').textContent = employee.isMentor;
          document.getElementById('viewEmploymentType').textContent = employee.employmentType;

          // Populate mentor assignments and tasks for viewing
          populateMentorAssignments(employeeId);
          populateTasks(employeeId);
          // Populate mentor assignments and tasks for viewing
          populateMentorAssignments(employeeId);
          populateTasks(employeeId);

          // Show the view modal
          $('#viewEmployeeModal').modal('show');
      })
      .catch(error => console.error('Error fetching employee details:', error));
          // Show the view modal
          $('#viewEmployeeModal').modal('show');
      })
      .catch(error => console.error('Error fetching employee details:', error));
}
window.viewEmployee = viewEmployee;

// editEmployee(employeeId, formData)
// Sends updated employee information to the server.
// Handles the server response to confirm the update and refreshes the displayed data.
window.viewEmployee = viewEmployee;

// editEmployee(employeeId, formData)
// Sends updated employee information to the server.
// Handles the server response to confirm the update and refreshes the displayed data.
function editEmployee(employeeId) {
  console.log(`Editing employee with ID: ${employeeId}`);
  fetch(`http://localhost:8080/newhireinfo/${employeeId}`)
    .then(response => response.json())
    .then(employee => {
      // Populate the edit form with the employee's details
      document.getElementById('editEmployeeId').value = employee.employeeId;
      document.getElementById('editEmployeeName').value = employee.name; 
      document.getElementById('editEmployeeIsMentor').checked = employee.isMentor;
      document.getElementById('editEmploymentType').value = employee.employmentType;

      // Populate mentor assignments
      populateMentorAssignments(employeeId); // Populate mentor assignments
      populateTasks(employeeId); // Populate tasks
      // Show the edit modal
      $('#editEmployeeModal').modal('show');

      // Show the edit modal
      // new bootstrap.Modal(document.getElementById('editEmployeeModal')).show();
    })
    .catch(error => console.error('Error fetching employee details:', error));
}
window.editEmployee = editEmployee;

// archiveEmployee(employeeId)
// Requests the server to archive (or delete) an employee entry.
// Updates the UI to reflect the removal or archival of the employee.
function archiveEmployee(employeeId) {
  const index = employees.findIndex(e => e.id === employeeId);
  if (index !== -1) {
    employees.splice(index, 1);
    renderEmployees();
  }
}
window.archiveEmployee = archiveEmployee;

// deleteEmployee(employeeId)
// Similar to archiveEmployee, but specifically sends a deletion request.
// Optionally confirms with the user before deletion.
// Function to delete an employee
function deleteEmployee(employeeId) {
  console.log(`Deleting employee with ID: ${employeeId}`);
  if (confirm('Are you sure you want to delete this employee, their tasks, mentor assignments, and login information?')) {
      fetch(`http://localhost:8080/newhireinfo/${employeeId}`, {
          method: 'DELETE'
          method: 'DELETE'
      })
      .then(response => {
          if (response.ok) {
              fetchAllEmployees(); // Refresh the employee list
              $('#deleteEmployeeModal').modal('hide'); // Close the modal
          } else {
              alert('Failed to delete employee.');
          }
      });
  }
}


// Additional Helper Functionsdown

// fetchMentors()
// Fetches mentor list from the server and populates the mentor dropdown.
function fetchMentors() {
  fetch('http://localhost:8080/newhireinfo/mentors')
  .then(response => response.json())
  .then(mentors => {
      const mentorSelect = document.getElementById('newMentorAssignments');
      mentors.forEach(mentor => {
          const option = document.createElement('option');
          option.value = mentor.employeeId;
          option.textContent = mentor.name;
          mentorSelect.appendChild(option);
      });
      // Optionally auto-select a default mentor if required
      // mentorSelect.value = 'defaultMentorId';
  })
  .catch(error => console.error('Error fetching mentors:', error));
}

// fetchMentees()
// Retrieves mentee list from the server and updates the mentee dropdown.
function fetchMentees() {
  fetch('http://localhost:8080/newhireinfo/unassigned-mentees')
    .then(response => response.json())
    .then(mentees => {
      const menteeSelect = document.getElementById('newMentorAssignments');
      mentees.forEach((mentee, index) => {
        const option = document.createElement('option');
        option.value = mentee.employeeId;
        option.textContent = mentee.name;
        option.selected = index === 0; // Auto-select the first unassigned mentee
        menteeSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching mentees:', error));
}

// populateMentorAssignments(employeeId)
// Fetches and displays mentor or mentee assignments for a specific employee.
function populateMentorAssignments(employeeId) {
  fetch(`http://localhost:8080/newhireinfo/${employeeId}`)
    .then(response => response.json())
    .then(employee => {
      const mentorAssignmentsSelect = document.getElementById('viewMentorAssignments');
      mentorAssignmentsSelect.innerHTML = ''; // Clear existing options

      if (employee.isMentor) {
        // If the employee is a mentor, fetch and list their mentees
        fetch(`http://localhost:8080/newhireinfo/${employeeId}/mentees`)
          .then(response => response.json())
          .then(mentees => {
            console.log('Mentees:', mentees);
            const viewMentorAssignments = document.getElementById('viewMentorAssignments');
            viewMentorAssignments.textContent = ''; // Clear existing list items

            mentees.forEach(mentee => {
              const li = document.createElement('li');
              li.textContent = `Mentee: ${mentee.name} - ${mentee.employmentType} `;
              viewMentorAssignments.appendChild(li);
            });            
          });
      } else {
        // If the employee is a mentee, note their mentor
        fetch(`http://localhost:8080/newhireinfo/${employeeId}/mentor`)
          .then(response => response.json())
          .then(mentors => {
            console.log('Mentors:', mentors);
            const viewMentorAssignments = document.getElementById('viewMentorAssignments');
            viewMentorAssignments.textContent = ''; // Clear existing list items

            mentors.forEach(mentor => {
              const li = document.createElement('li');
              li.textContent = `Mentor: ${mentor.name} - ${mentor.employmentType} `;
              viewMentorAssignments.appendChild(li);
            });            
          });
      }
    });
}

// populateTasks(employeeId)
// Fetches and shows tasks assigned to an employee, differentiating by mentor or mentee roles.
function populateTasks(employeeId) {
  fetch(`http://localhost:8080/newhireinfo/${employeeId}`)
  .then(response => response.json())
  .then(employee => {
    const mentorAssignmentsSelect = document.getElementById('viewMentorAssignments');
    mentorAssignmentsSelect.innerHTML = ''; // Clear existing options
  //if the employee is a mentor, fetch and list their tasks
  if (employee.isMentor) {
  fetch(`http://localhost:8080/peercodingtasks/mentor/${employeeId}/tasks`)
      .then(response => response.json())
      .then(tasks => {
        console.log('Tasks:', tasks);
        const tasksList = document.getElementById('viewTasks');
        tasksList.innerHTML = ''; // Clear existing list items
  
        tasks.forEach(task => {
          const li = document.createElement('li');
          li.innerHTML = `Assignment: ${task.assigneeName}, Task ID: ${task.taskId}, Task URL: <a href="${task.taskUrl}" target="_blank">${task.taskUrl}</a>, Task Type: ${task.taskType}, Total Hours: ${task.totalHours}`;
          tasksList.appendChild(li);
        });
      });
    } else {
      // If the employee is a mentee list their tasks
      fetch(`http://localhost:8080/peercodingtasks/by-assignee/${employeeId}`)
      .then(response => response.json())
      .then(tasks => {
        console.log('Tasks:', tasks);
        const tasksList = document.getElementById('viewTasks');
        tasksList.innerHTML = ''; // Clear existing list items
  
        tasks.forEach(task => {
          const li = document.createElement('li');
          li.innerHTML = `Task ID: ${task.taskId}, Task URL: <a href="${task.taskUrl}" target="_blank">${task.taskUrl}</a>, Task Type: ${task.taskType}, Total Hours: ${task.totalHours}`;
          tasksList.appendChild(li);
        });
      });
      
    }
  });    
}

// Add this event listener when the 'New Employee' modal is shown
$('#newEmployeeModal').on('show.bs.modal', function () {
  // Reset and populate the mentor dropdown if the employee is not a mentor
  const mentorSelect = document.getElementById('newMentorAssignments');
  mentorSelect.innerHTML = '<option value="">Select Mentor</option>';
  if (!document.getElementById('newEmployeeIsMentor').checked) {
    fetchMentors(); // This should fetch and populate the mentor dropdown
  }
});

// Modal initialization
// This should be triggered when the edit button is clicked and the modal is about to be shown.
$('#editEmployeeModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var employeeId = button.data('employee-id'); // Extract info from data-* attributes
  $(this).data('employeeId', employeeId); // Set employeeId to the modal for later use
  editEmployee(employeeId);
});

