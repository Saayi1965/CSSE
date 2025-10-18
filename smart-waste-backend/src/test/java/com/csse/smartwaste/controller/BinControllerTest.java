package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.service.BinService;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * ✅ Unit Tests for BinController
 * Matches with your current BinServiceImpl logic.
 */
class BinControllerTest {

    @Mock
    private BinService binService;

    @InjectMocks
    private BinController binController;

    private Bin sampleBin;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sampleBin = new Bin();
        sampleBin.setBinId("BIN-100");
        sampleBin.setOwnerName("Shanchika");
        sampleBin.setBinType("General");
    }

    @Test
    void testGetAllBins_Success() {
        when(binService.getAllBins()).thenReturn(List.of(sampleBin, new Bin()));

        ResponseEntity<List<Bin>> response = binController.getAllBins();

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(binService, times(1)).getAllBins();
    }

    @Test
    void testRegisterBin_Success() {
        when(binService.registerBin(any(Bin.class))).thenReturn(sampleBin);

        ResponseEntity<?> response = binController.registerBin(sampleBin);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Bin);
        assertEquals("BIN-100", ((Bin) response.getBody()).getBinId());
    }

    @Test
    void testRegisterBin_Failure() {
        when(binService.registerBin(any(Bin.class)))
                .thenThrow(new RuntimeException("Database error"));

        ResponseEntity<?> response = binController.registerBin(sampleBin);

        assertEquals(500, response.getStatusCodeValue());
        assertEquals("Error registering bin", response.getBody());
        verify(binService, times(1)).registerBin(any(Bin.class));
    }

    @Test
    void testGetBinById_Success() {
        when(binService.getBinById("BIN-100")).thenReturn(sampleBin);

        ResponseEntity<Bin> response = binController.getBinById("BIN-100");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("BIN-100", response.getBody().getBinId());
    }

    @Test
    void testGetBinById_NotFound() {
        when(binService.getBinById("BIN-404")).thenReturn(null);

        ResponseEntity<Bin> response = binController.getBinById("BIN-404");

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @AfterEach
    void tearDown() {
        Mockito.framework().clearInlineMocks();
    }
}
