// src/main/java/com/CiST2932/SRSProject/Service/NewHireInfoService.java

package com.CiST2932.SRSProject.Service;

import com.CiST2932.SRSProject.Domain.MentorAssignments;
import com.CiST2932.SRSProject.Domain.NewEmployeeDTO;
import com.CiST2932.SRSProject.Domain.NewHireInfo;
import com.CiST2932.SRSProject.Domain.NewHireInfoDTO;
import com.CiST2932.SRSProject.Domain.PeerCodingTasks;
import com.CiST2932.SRSProject.Domain.TaskDTO;
import com.CiST2932.SRSProject.Domain.Users;
import com.CiST2932.SRSProject.Repository.NewHireInfoRepository;
import com.CiST2932.SRSProject.Repository.PeerCodingTasksRepository;
import com.CiST2932.SRSProject.Repository.UsersRepository;
import com.CiST2932.SRSProject.Repository.MentorAssignmentsRepository;
import com.CiST2932.SRSProject.Repository.PeerCodingTasksRepository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.modelmapper.ModelMapper;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;

@Service
public class NewHireInfoService {
    @Autowired
    private NewHireInfoRepository newHireInfoRepository;
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private MentorAssignmentsRepository mentorAssignmentsRepository;
    @Autowired
    private PeerCodingTasksRepository peerCodingTasksRepository;
    @Autowired
    private ModelMapper modelMapper;
    
    public List<NewHireInfo> findAll() {
        return newHireInfoRepository.findAll();
    }

    public Optional<NewHireInfo> findById(int id) {
        return newHireInfoRepository.findById(id);
    }

    @SuppressWarnings("null")
    public NewHireInfo save(NewHireInfo newHireInfo) {
        return newHireInfoRepository.save(newHireInfo);
    }

    public void deleteById(int id) {
        newHireInfoRepository.deleteById(id);
    }

    @Transactional
    public void deleteNewHireInfoAndRelatedData(int employeeId) {
        NewHireInfo newHireInfo = newHireInfoRepository.findById(employeeId).orElseThrow(() ->
            new IllegalStateException("Employee not found with id: " + employeeId));
    
        // Attempt to delete User first if exists
        try {
            if (newHireInfo.getUser() != null) {
                usersRepository.deleteByEmployeeId(newHireInfo.getUser().getEmployeeId());
            }
    
            // Then delete related data to avoid foreign key constraints
            peerCodingTasksRepository.deleteByEmployeeId(employeeId);
            mentorAssignmentsRepository.deleteByEmployeeId(employeeId);
    
            // Finally, delete the NewHireInfo record itself
            newHireInfoRepository.deleteById(employeeId);
        } catch (Exception e) {
            // Log error or handle it as necessary
            throw new RuntimeException("Error deleting employee and related data: " + e.getMessage(), e);
        }
    }
 
    public List<NewHireInfo> findMenteesByMentorId(int mentorId) {
        return newHireInfoRepository.findMenteesByMentorId(mentorId);
    }

    public List<NewHireInfo> findMentorByMenteeId(int menteeId) {
        return newHireInfoRepository.findMentorByMenteeId(menteeId);
    }

    public List<NewHireInfo> findUnassignedMentees() {
        return newHireInfoRepository.findUnassignedMentees();
    }   

    public List<NewHireInfo> findAllMentors() {
        return newHireInfoRepository.findAllMentors();
    }

    public List<NewHireInfoDTO> findAllDtos() {
        List<NewHireInfo> newHireInfos = newHireInfoRepository.findAll();
        List<NewHireInfoDTO> newHireInfoDTOs = new java.util.ArrayList<>();
        for (NewHireInfo newHireInfo : newHireInfos) {
            newHireInfoDTOs.add(new NewHireInfoDTO(
                newHireInfo.getEmployeeId(), 
                newHireInfo.getName(), 
                newHireInfo.getEmploymentType(), 
                newHireInfo.getIsMentor()));
            }
        return newHireInfoDTOs;
    }
    
    public List<String> findAllNames() {
        return newHireInfoRepository.findAllNames();
    }

    @Transactional
    public NewHireInfo createNewHireInfo(NewEmployeeDTO newEmployeeDTO) {
        NewHireInfo newHireInfo = new NewHireInfo();
        // Set basic properties
        newHireInfo.setName(newEmployeeDTO.getName());
        newHireInfo.setIsMentor(newEmployeeDTO.getIsMentor());
        newHireInfo.setEmploymentType(newEmployeeDTO.getEmploymentType());
        newHireInfo.setEmployeeId(newEmployeeDTO.getEmployeeId());
        newHireInfo.setAssignmentsAsMentor(new java.util.ArrayList<>());
        newHireInfo.setAssignmentsAsMentee(new java.util.ArrayList<>());
    
        // Save to get the generated ID
        NewHireInfo savedNewHireInfo = newHireInfoRepository.save(newHireInfo);
        
        // Print out the newHireInfo employeeId
        System.out.println("Employee ID: " + newHireInfo.getEmployeeId());

        // Handle Users creation
        if (newEmployeeDTO.getUsername() != null) {
            Users user = new Users();
            user.setNewHireInfo(savedNewHireInfo);
            user.setUsername(newEmployeeDTO.getUsername());
            user.setPasswordHash(newEmployeeDTO.getPasswordHash());
            user.setEmail(newEmployeeDTO.getEmail());
            user.setRegistrationDate(new Timestamp(System.currentTimeMillis()));
            savedNewHireInfo.setUser(user);
            usersRepository.save(user);
        }
    
// Handle mentorship assignment
if (newEmployeeDTO.getMentorOrMenteeId() != null && newEmployeeDTO.getMentorOrMenteeId() != 0) {
    MentorAssignments mentorAssignment = new MentorAssignments();
    // Assuming newEmployeeDTO.getMentorOrMenteeId() returns the mentor's ID
    NewHireInfo mentor = newHireInfoRepository.findById(newEmployeeDTO.getMentorOrMenteeId()).orElse(null);
    mentorAssignment.setMentor(mentor);
    mentorAssignment.setMentee(savedNewHireInfo);

    if (mentor != null) {
        mentorAssignmentsRepository.save(mentorAssignment);
        System.out.println("Mentor Assignment Saved: Mentor ID - " + mentor.getEmployeeId() + ", Mentee ID - " + savedNewHireInfo.getEmployeeId());
    } else {
        System.out.println("Mentor ID not found: " + newEmployeeDTO.getMentorOrMenteeId());
    }
    
  
    // Save the mentorship assignment
    mentorAssignmentsRepository.save(mentorAssignment);
  }
  
    // print out the username
    System.out.println("Username: " + newEmployeeDTO.getUsername());
    // refresh the newHireInfo
    newHireInfo = newHireInfoRepository.findById(newHireInfo.getEmployeeId()).get();
    System.out.println("Employee ID: " + newHireInfo.getEmployeeId());
  
  
    // Save the NewHireInfo entity, cascade should save Users too
    return newHireInfoRepository.save(newHireInfo);
}
    
@Transactional
public NewHireInfo updateOrCreateEmployee(NewEmployeeDTO newEmployeeDTO) {
    NewHireInfo newHireInfo = newHireInfoRepository.findById(newEmployeeDTO.getEmployeeId())
                                                    .orElseGet(() -> new NewHireInfo());
    updateNewHireInfoFromDto(newHireInfo, newEmployeeDTO);
    handleUserUpdate(newHireInfo, newEmployeeDTO);
    handleMentorOrMenteeAssignment(newHireInfo, newEmployeeDTO);
    return newHireInfoRepository.save(newHireInfo);
}

private void handleUserUpdate(NewHireInfo newHireInfo, NewEmployeeDTO newEmployeeDTO) {
    Users user = newHireInfo.getUser();
    if (user == null) {
        user = new Users();
        user.setNewHireInfo(newHireInfo);
    }
    user.setUsername(newEmployeeDTO.getUsername());
    user.setEmail(newEmployeeDTO.getEmail());
    user.setPasswordHash(newEmployeeDTO.getPasswordHash());
    user.setRegistrationDate(new Timestamp(System.currentTimeMillis()));
    usersRepository.save(user);
    newHireInfo.setUser(user);
}

private void updateNewHireInfoFromDto(NewHireInfo newHireInfo, NewEmployeeDTO dto) {
    newHireInfo.setName(dto.getName());
    newHireInfo.setIsMentor(dto.getIsMentor());
    newHireInfo.setEmploymentType(dto.getEmploymentType());
}

    private void handleMentorOrMenteeAssignment(NewHireInfo newHireInfo, NewEmployeeDTO newEmployeeDTO) {
        Optional<NewHireInfo> mentorOrMenteeOpt = newHireInfoRepository.findById(newEmployeeDTO.getMentorOrMenteeId());
        if (mentorOrMenteeOpt.isPresent()) {
            MentorAssignments mentorAssignment = new MentorAssignments();
            NewHireInfo mentorOrMentee = mentorOrMenteeOpt.get();
            mentorAssignment.setMentor(newHireInfo.getIsMentor() ? newHireInfo : mentorOrMentee);
            mentorAssignment.setMentee(newHireInfo.getIsMentor() ? mentorOrMentee : newHireInfo);
    
            // Log the assignment details before saving
            System.out.println("Creating Mentor Assignment: " + mentorAssignment);
    
            mentorAssignmentsRepository.save(mentorAssignment);
            System.out.println("Mentor Assignment Saved: " + mentorAssignment);
        } else {
            System.out.println("Mentor/Mentee ID not found: " + newEmployeeDTO.getMentorOrMenteeId());
        }
    }

        // print out the username
        System.out.println("Username: " + newEmployeeDTO.getUsername());
        // refresh the newHireInfo
        newHireInfo = newHireInfoRepository.findById(newHireInfo.getEmployeeId()).get();
        System.out.println("Employee ID: " + newHireInfo.getEmployeeId());

    
        // Save the NewHireInfo entity, cascade should save Users too
        return newHireInfoRepository.save(newHireInfo);        
    }

    public NewHireInfo updateEmployee(int id, NewEmployeeDTO newEmployeeDTO) {
        NewHireInfo employee = newHireInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceAccessException("Employee not found with id " + id));
        modelMapper.map(newEmployeeDTO, employee);
        return newHireInfoRepository.save(employee);
    }

    @Transactional
    public NewHireInfo updateOrCreateEmployee(int id, NewEmployeeDTO newEmployeeDTO) {
        // Fetch the existing NewHireInfo or create a new one
        NewHireInfo newHireInfo = newHireInfoRepository.findById(id).orElse(new NewHireInfo());

        // Use modelMapper to map DTO to entity
        modelMapper.map(newEmployeeDTO, newHireInfo);

        // Save the NewHireInfo entity
        NewHireInfo savedNewHireInfo = newHireInfoRepository.save(newHireInfo);

        // Handling the Users entity
        Users user = usersRepository.findById(newHireInfo.getEmployeeId()).orElse(new Users());
        user.setNewHireInfo(savedNewHireInfo);
        user.setEmail(newEmployeeDTO.getEmail());
        user.setUsername(newEmployeeDTO.getUsername());
        user.setPasswordHash(newEmployeeDTO.getPasswordHash());
        user.setRegistrationDate(new Timestamp(System.currentTimeMillis()));

        // Link User to NewHireInfo
        savedNewHireInfo.setUser(user);

@Transactional(readOnly = true)
public NewEmployeeDTO getEmployeeDetails(int employeeId) {
    NewHireInfo employee = newHireInfoRepository.findById(employeeId).orElse(null);
    if (employee == null) {
        return null;
    }
    NewEmployeeDTO dto = new NewEmployeeDTO();
    dto.setEmployeeId(employee.getEmployeeId());
    dto.setName(employee.getName());
    dto.setIsMentor(employee.getIsMentor());
    dto.setEmploymentType(employee.getEmploymentType());

    // Access the Users entity through the NewHireInfo entity
    Users user = employee.getUser();
    if (user != null) {
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPasswordHash(user.getPasswordHash());
        dto.setRegistrationDate(user.getRegistrationDate());
    }
    if (employee.getIsMentor()) {
        // Assume that each mentor has multiple mentees
        List<Integer> menteeIds = newHireInfoRepository.findMenteesByMentorId(employeeId)
        .stream()
        .map(NewHireInfo::getEmployeeId)
        .collect(Collectors.toList());
    dto.setAssignmentsAsMentorIds(menteeIds); // If multiple, pick first or adjust as needed
    } else {
        // Assume each mentee has one mentor
        Optional<Integer> mentorId = newHireInfoRepository.findMentorByMenteeId(employeeId)
        .stream()
        .map(NewHireInfo::getEmployeeId)
        .findFirst(); // Only get the first (or only) mentor ID
            dto.setMentorOrMenteeId(mentorId.orElse(null)); // Set the mentor ID in the DTO, handling null if not found
        }
        
        List<TaskDTO> tasks = peerCodingTasksRepository.findByAssigneeId(employeeId)
                .stream()
                .map(this::convertToTaskDto)
                .collect(Collectors.toList());
        dto.setTasks(tasks);
        
        return dto;
        }
        
        private TaskDTO convertToTaskDto(PeerCodingTasks task) {
        TaskDTO dto = new TaskDTO();
        dto.setTaskId(task.getTaskId());
        dto.setTaskUrl(task.getTaskUrl());
        dto.setTaskNumber(task.getTaskNumber());
        dto.setTaskType(task.getTaskType());
        dto.setTotalHours(task.getTotalHours());
        dto.setAssigneeName(task.getAssignee().getName()); // Assuming Task has a reference to Assignee which is an Employee
        return dto;
        }

}

        return savedNewHireInfo;
    }