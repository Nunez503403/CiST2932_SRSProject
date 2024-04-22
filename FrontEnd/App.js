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
  // document.getElementById('newEmployeeIsMentor').addEventListener('change', handleMentorChange);
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
      },
      body: JSON.stringify(employeeData)
  })
  .then(response => {
      if (response.ok) {
          onsole.log("Employee created successfully with ID:", data.employeeId);
          fetchAllEmployees(); // Refresh the employee list
          document.getElementById('newEmployeeForm').reset(); // Reset the form
          $('#newEmployeeModal').modal('hide'); // Close the modal
      } else {
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

          // Populate mentor assignments and tasks for viewing
          populateMentorAssignments(employeeId);
          populateTasks(employeeId);

          // Show the view modal
          $('#viewEmployeeModal').modal('show');
      })
      .catch(error => console.error('Error fetching employee details:', error));
}
window.viewEmployee = viewEmployee;

// editEmployee(employeeId, formData)
// Sends updated employee information to the server.
// Handles the server response to confirm the update and refreshes the displayed data.
function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const newName = prompt('Enter new name:', employee.name);
      const newEmail = prompt('Enter new email:', employee.email);
      const newIsMentor = confirm('Is this employee a mentor?');
      const newEmploymentType = prompt('Enter new employment type:', employee.employmentType);
      if (newName && newEmail && newEmploymentType) {
        employee.name = newName;
        employee.email = newEmail;
        employee.isMentor = newIsMentor;
        employee.employmentType = newEmploymentType;
        renderEmployees();
      }
    }
  }

  // Function to archive an employee
function archiveEmployee(employeeId) {
    const index = employees.findIndex(e => e.id === employeeId);
    if (index !== -1) {
      employees.splice(index, 1);
      renderEmployees();
    }
  }
  
  // Function to delete an employee
  function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee?')) {
      fetch(`http://localhost:8080/newhireinfo/${employeeId}`, {
          method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          fetchAllEmployees(); // Refresh the employee list
        } else {
          alert('Failed to delete employee.');
        }
      })
      .catch(error => console.error('Error deleting employee:', error));
    }
  }
  
  // Event listener for the 'New Employee' form submission
  document.getElementById('newEmployeeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    createEmployee();
  });
  
  // Fetch all employees on page load
  document.addEventListener('DOMContentLoaded', fetchAllEmployees);
  