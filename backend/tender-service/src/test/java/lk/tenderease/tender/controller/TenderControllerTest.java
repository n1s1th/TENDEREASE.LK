package lk.tenderease.tender.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import lk.tenderease.tender.service.TenderService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(TenderController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for basic controller test
class TenderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TenderService tenderService;

    @Test
    void testListMinistriesEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/tenders/reference-data/ministries"))
               .andExpect(status().isOk());
    }
}
