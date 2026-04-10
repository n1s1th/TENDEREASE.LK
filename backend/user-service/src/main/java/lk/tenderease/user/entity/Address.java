package lk.tenderease.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Embeddable value object representing a physical address.
 * Embedded within the {@link Officer} entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class Address {

    @Column(name = "country")
    private String country;

    @Column(name = "street_line_1")
    private String streetLine1;

    @Column(name = "street_line_2")
    private String streetLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "province")
    private String province;

    @Column(name = "postal_code")
    private String postalCode;
}
