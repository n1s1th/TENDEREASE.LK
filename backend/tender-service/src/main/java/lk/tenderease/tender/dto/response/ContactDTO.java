package lk.tenderease.tender.dto.response;

import lombok.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactDTO {

    private String officerName;
    private String designation;
    private String email;
    private String phone;
    private String department;
}