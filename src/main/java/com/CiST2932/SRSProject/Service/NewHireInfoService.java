// src/main/java/com/CiST2932/SRSProject/Service/NewHireInfoService.java

package com.CiST2932.SRSProject.Service;

import com.CiST2932.SRSProject.Domain.MentorAssignments;
import com.CiST2932.SRSProject.Domain.NewEmployeeDTO;
import com.CiST2932.SRSProject.Domain.NewHireInfo;
import com.CiST2932.SRSProject.Domain.NewHireInfoDTO;
import com.CiST2932.SRSProject.Domain.Users;
import com.CiST2932.SRSProject.Repository.NewHireInfoRepository;
import com.CiST2932.SRSProject.Repository.UsersRepository;
import com.CiST2932.SRSProject.Repository.MentorAssignmentsRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import java.util.List;
import java.util.Optional;
import java.sql.Timestamp;

@Service
public class NewHireInfoService {

    @Autowired
    private NewHireInfoRepository newHireInfoRepository;
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private MentorAssignmentsRepository mentorAssignmentsRepository;
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

    public NewHireInfo createNewHireInfo(NewEmployeeDTO newEmployeeDTO) {
        NewHireInfo newHireInfo = new NewHireInfo();
        newHireInfo.setName(newEmployeeDTO.getName());
        newHireInfo.setIsMentor(newEmployeeDTO.getIsMentor());
        newHireInfo.setEmploymentType(newEmployeeDTO.getEmploymentType());
        newHireInfo.setEmployeeId(newEmployeeDTO.getEmployeeId());

        // Save the NewHireInfo entity
        NewHireInfo savedNewHireInfo = newHireInfoRepository.save(newHireInfo);

        // Print out the newHireInfo employeeId
        System.out.println("Employee ID: " + newHireInfo.getEmployeeId());


        // If username and password are provided, create the Users object first
        if (newEmployeeDTO.getUsername() != null && newEmployeeDTO.getPasswordHash() != null) {
            Users user = new Users();
            // Set the EmployeeID from NewHireInfo
            user. setNewHireInfo(newHireInfo);
            user.setEmail(newEmployeeDTO.getEmail());
            user.setUsername(newEmployeeDTO.getUsername());
            user.setPasswordHash(newEmployeeDTO.getPasswordHash()); // Consider using a hashed password
            user.setRegistrationDate(new Timestamp(System.currentTimeMillis()));

        // Associate User with NewHireInfo
        newHireInfo.setUser(user);
        user.setNewHireInfo(newHireInfo);

        // Save the Users entity, it should now have the correct employeeId
        usersRepository.save(user);

        }

    // Handle mentorship assignment
    if (newEmployeeDTO.getMentor() != 0) {
        MentorAssignments mentorAssignment = new MentorAssignments();
        NewHireInfo mentor = newHireInfoRepository.findById(newEmployeeDTO.getMentor()).orElse(null);
        mentorAssignment.setMentor(mentor);
        mentorAssignment.setMentee(savedNewHireInfo);

        if (mentor != null) {
            mentorAssignment.setMentor(mentor);
            mentorAssignment.setMentee(savedNewHireInfo);
            mentorAssignmentsRepository.save(mentorAssignment);
            System.out.println("Mentor Assignment Saved: Mentor ID - " + mentor.getEmployeeId() + " Mentee ID - " + savedNewHireInfo.getEmployeeId());
        } else {
            System.out.println("Mentor ID not found: " + newEmployeeDTO.getMentor());
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
        
    public NewHireInfo updateEmployee(int id, NewEmployeeDTO newEmployeeDTO) {
        NewHireInfo employee = newHireInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceAccessException("Employee not found with id " + id));
        modelMapper.map(newEmployeeDTO, employee);
        return newHireInfoRepository.save(employee);
    }
    
    @Transactional
    public NewHireInfo updateOrCreateEmployee(int id, NewEmployeeDTO newEmployeeDTO) {
        // First, fetch the existing NewHireInfo or create a new one
        NewHireInfo newHireInfo = newHireInfoRepository.findById(id).orElse(new NewHireInfo());

        // Update properties from DTO
        newHireInfo.setIsMentor(newEmployeeDTO.getIsMentor());
        newHireInfo.setEmploymentType(newEmployeeDTO.getEmploymentType());  // Assuming these are included in DTO
        newHireInfo.setName(newEmployeeDTO.getName()); // Assume name is also updatable

        // Save the NewHireInfo entity and ensure it has an ID
        newHireInfo = newHireInfoRepository.save(newHireInfo);

        // Handle the Users entity
        Users user = usersRepository.findById(id).orElse(new Users());

        // Set properties from the DTO
        user.setNewHireInfo(newHireInfo);
        user.setEmail(newEmployeeDTO.getEmail());
        user.setUsername(newEmployeeDTO.getUsername());
        user.setPasswordHash(newEmployeeDTO.getPasswordHash());
        user.setRegistrationDate(new Timestamp(System.currentTimeMillis()));

        // Link User to NewHireInfo
        newHireInfo.setUser(user);

        // Save or update the User
        usersRepository.save(user);

        return newHireInfo;
    } 


    
}
