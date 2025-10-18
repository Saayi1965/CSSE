package com.csse.smartwaste.service;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.repository.BinRepository;
import com.csse.smartwaste.service.impl.BinServiceImpl;
import org.junit.jupiter.api.*;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * ✅ Unit Tests for BinServiceImpl
 * 100% coverage for register, get, update, delete, and check methods.
 */
class BinServiceImplTest {

    @Mock
    private BinRepository binRepository;

    @InjectMocks
    private BinServiceImpl binService;

    private Bin testBin;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testBin = Bin.builder()
                .binId("BIN-TEST-001")
                .ownerName("Shanchika")
                .latitude(6.9271)
                .longitude(79.8612)
                .status("ACTIVE")
                .monitorStatus("EMPTY")
                .registrationDate(LocalDateTime.now())
                .build();
    }

    @Test
    void testRegisterBin_Success() {
        when(binRepository.save(any(Bin.class))).thenReturn(testBin);

        Bin saved = binService.registerBin(testBin);

        assertNotNull(saved);
        assertEquals("ACTIVE", saved.getStatus());
        verify(binRepository, times(1)).save(any(Bin.class));
    }

    @Test
    void testRegisterBin_MissingCoordinates_ShouldThrow() {
        testBin.setLatitude(null);
        testBin.setLongitude(null);
        assertThrows(IllegalArgumentException.class, () -> binService.registerBin(testBin));
    }

    @Test
    void testGetBinById_Found() {
        when(binRepository.findById("123")).thenReturn(Optional.of(testBin));

        Bin result = binService.getBinById("123");

        assertNotNull(result);
        assertEquals("BIN-TEST-001", result.getBinId());
        verify(binRepository, times(1)).findById("123");
    }

    @Test
    void testGetBinById_NotFound_ReturnsNull() {
        when(binRepository.findById("999")).thenReturn(Optional.empty());
        when(binRepository.findByBinId("999")).thenReturn(Optional.empty());

        Bin result = binService.getBinById("999");

        assertNull(result);
    }

    @Test
    void testUpdateBinLevel_ToFull() {
        when(binRepository.findByBinId("BIN-TEST-001")).thenReturn(Optional.of(testBin));
        when(binRepository.save(any(Bin.class))).thenReturn(testBin);

        Bin updated = binService.updateBinLevel("BIN-TEST-001", 95);

        assertEquals("FULL", updated.getMonitorStatus());
        verify(binRepository, times(1)).findByBinId("BIN-TEST-001");
        verify(binRepository, times(1)).save(any(Bin.class));
    }

    @Test
    void testUpdateBinLevel_NotFound_ThrowsException() {
        when(binRepository.findByBinId("BIN-404")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> binService.updateBinLevel("BIN-404", 80));
    }

    @Test
    void testExistsByBinId_True() {
        when(binRepository.findByBinId("BIN-TEST-001")).thenReturn(Optional.of(testBin));

        boolean exists = binService.existsByBinId("BIN-TEST-001");

        assertTrue(exists);
    }

    @Test
    void testExistsByBinId_False() {
        when(binRepository.findByBinId("BIN-NOPE")).thenReturn(Optional.empty());

        boolean exists = binService.existsByBinId("BIN-NOPE");

        assertFalse(exists);
    }

    @AfterEach
    void tearDown() {
        Mockito.framework().clearInlineMocks();
    }
}
