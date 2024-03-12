// src/main/java/com/CiST2932/SRSProject/Service/NewHireInfoService.java

package com.CiST2932.SRSProject.Service;

import com.CiST2932.SRSProject.Domain.NewHireInfo;
import com.CiST2932.SRSProject.Domain.NewHireInfoDto;
import com.CiST2932.SRSProject.Repository.NewHireInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class NewHireInfoService {

    @Autowired
    private NewHireInfoRepository newHireInfoRepository;

    public List<NewHireInfo> findAll() {
        return newHireInfoRepository.findAll();
    }

    public Optional<NewHireInfo> findById(int id) {
        return newHireInfoRepository.findById(id);
    }

    public List<NewHireInfo> findAllMentors() {
        return newHireInfoRepository.findByMentor(true);
    }     

    @SuppressWarnings("null")
    public NewHireInfo save(NewHireInfo newHireInfo) {
        return newHireInfoRepository.save(newHireInfo);
    }

    public void deleteById(int id) {
        newHireInfoRepository.deleteById(id);
    }

    // public List<NewHireInfo> findMenteesByMentorId(int mentorId) {
    //     return newHireInfoRepository.findMenteesByMentorId(mentorId);
    // }

    // public NewHireInfo assignMentor(int menteeId, int mentorId) {
    //     Optional<NewHireInfo> mentee = newHireInfoRepository.findById(menteeId);
    //     if (mentee.isPresent()) {
    //         NewHireInfo updatedMentee = mentee.get();
    //         updatedMentee.setMentorId(mentorId);
    //         return newHireInfoRepository.save(updatedMentee);
    //     } else {
    //         throw new NoSuchElementException("Mentee with id " + menteeId + " not found");
    //     }
    // }

    public List<NewHireInfo> findDistinctMentors() {
        return newHireInfoRepository.findDistinctMentors();
    }

    public List<NewHireInfoDto> findMenteesByMentorId(Integer mentorId) {
        return newHireInfoRepository.findMenteesByMentorId(mentorId);
    }
    
    public List<NewHireInfo> findAllMentees() {
        return newHireInfoRepository.findAllMentees();
    }

    public List<NewHireInfoDto> findAllMenteesDto() {
        return newHireInfoRepository.findAllMenteesDto();
    }
    
    
}
