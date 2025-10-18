package com.csse.smartwaste.controller;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.OutputStreamWriter;
import java.io.ByteArrayOutputStream;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDFont;
import java.io.InputStream;
import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.csse.smartwaste.repository.BinRepository;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.csse.smartwaste.model.Bin;

@RestController
@RequestMapping("/api/bins")
@CrossOrigin(origins = {"http://localhost:3000","http://127.0.0.1:3000"}, allowCredentials = "true", maxAge = 3600)
public class BinController {
    private final BinRepository binRepository;

    public BinController(BinRepository binRepository) {
        this.binRepository = binRepository;
    }

    @GetMapping("")
    public List<Bin> list() {
        try {
            List<Bin> fromDb = binRepository.findAll();
            if (fromDb != null && !fromDb.isEmpty()) return fromDb;
        } catch (Exception e) {
            // ignore and fall back to sample data
        }
        return Arrays.asList(
            Bin.builder().binId("B-101").location("North Zone - Colombo").level(78).binType("Organic").ownerName("CityWorks").nextCollection(null).build(),
            Bin.builder().binId("B-102").location("South Zone - Dehiwala").level(42).binType("Plastic").ownerName("MarketDept").nextCollection(null).build(),
            Bin.builder().binId("B-103").location("East Zone - Kandy").level(93).binType("Paper").ownerName("University").nextCollection(null).build(),
            Bin.builder().binId("B-104").location("West Zone - Galle").level(12).binType("Metal").ownerName("Harbor").nextCollection(null).build()
        );
    }

    // Export CSV for bins (supports optional filtering via query params)
    @GetMapping(value = "/export/csv")
    public ResponseEntity<byte[]> exportCsv(@org.springframework.web.bind.annotation.RequestParam(required = false) String type,
                                            @org.springframework.web.bind.annotation.RequestParam(required = false) String owner,
                                            @org.springframework.web.bind.annotation.RequestParam(required = false) String search) {
        try {
            List<Bin> bins = list();
            // apply filters
            List<Bin> filtered = bins.stream().filter(b -> {
                if (type != null && !type.isBlank()) {
                    if (b.getBinType() == null || !b.getBinType().equals(type)) return false;
                }
                if (owner != null && !owner.isBlank()) {
                    if (b.getOwnerName() == null || !b.getOwnerName().equals(owner)) return false;
                }
                if (search != null && !search.isBlank()) {
                    String s = search.toLowerCase();
                    boolean match = (b.getBinId() != null && b.getBinId().toLowerCase().contains(s)) ||
                                    (b.getLocation() != null && b.getLocation().toLowerCase().contains(s));
                    if (!match) return false;
                }
                return true;
            }).collect(Collectors.toList());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (OutputStreamWriter writer = new OutputStreamWriter(baos, java.nio.charset.StandardCharsets.UTF_8)) {
                CSVFormat csvFmt = CSVFormat.DEFAULT.builder().setHeader("id","location","type","owner","level","scheduledAt").build();
                try (CSVPrinter printer = new CSVPrinter(writer, csvFmt)) {
                for (Bin b : filtered) {
                    printer.printRecord(b.getBinId(), b.getLocation(), b.getBinType(), b.getOwnerName(), b.getLevel(), b.getNextCollection() == null ? "" : b.getNextCollection().toString());
                }
                }
            }
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bins.csv");
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("text/csv")).body(baos.toByteArray());
        } catch (Exception ex) {
            ex.printStackTrace();
            String json = "{\"error\":\"internal_error\",\"message\":\"" + (ex.getMessage() == null ? "CSV export failed" : ex.getMessage().replace("\"","\\\"")) + "\"}";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).header(HttpHeaders.CONTENT_TYPE, "application/json").body(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    // Export PDF for bins (supports optional filtering)
    @GetMapping(value = "/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@org.springframework.web.bind.annotation.RequestParam(required = false) String type,
                                            @org.springframework.web.bind.annotation.RequestParam(required = false) String owner,
                                            @org.springframework.web.bind.annotation.RequestParam(required = false) String search) {
        try {
            List<Bin> bins = list();
            List<Bin> filtered = bins.stream().filter(b -> {
                if (type != null && !type.isBlank()) {
                    if (b.getBinType() == null || !b.getBinType().equals(type)) return false;
                }
                if (owner != null && !owner.isBlank()) {
                    if (b.getOwnerName() == null || !b.getOwnerName().equals(owner)) return false;
                }
                if (search != null && !search.isBlank()) {
                    String s = search.toLowerCase();
                    boolean match = (b.getBinId() != null && b.getBinId().toLowerCase().contains(s)) ||
                                    (b.getLocation() != null && b.getLocation().toLowerCase().contains(s));
                    if (!match) return false;
                }
                return true;
            }).collect(Collectors.toList());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (PDDocument doc = new PDDocument()) {
                PDPage page = new PDPage(PDRectangle.LETTER);
                doc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.beginText();
                    PDType0Font regular = null;
                    PDType0Font bold = null;
                    try {
                        String windir = System.getenv("WINDIR");
                        if (windir != null) {
                            File arial = new File(windir + "\\Fonts\\arial.ttf");
                            File arialbd = new File(windir + "\\Fonts\\arialbd.ttf");
                            if (arial.exists()) regular = PDType0Font.load(doc, arial);
                            if (arialbd.exists()) bold = PDType0Font.load(doc, arialbd);
                        }
                    } catch (Exception ex) { }
                    if (regular == null) {
                        try {
                            InputStream is = PDType0Font.class.getResourceAsStream("/fonts/DejaVuSans.ttf");
                            if (is != null) regular = PDType0Font.load(doc, is);
                        } catch (Exception ex) { }
                    }
                    if (bold == null) bold = regular;
                    PDFont fontRegular;
                    PDFont fontBold;
                    if (regular != null) {
                        fontRegular = regular;
                        fontBold = (bold != null) ? bold : regular;
                    } else {
                        PDFont tmpReg = null;
                        PDFont tmpBold = null;
                        try {
                            java.lang.reflect.Field fReg = PDType1Font.class.getField("HELVETICA");
                            java.lang.reflect.Field fBold = PDType1Font.class.getField("HELVETICA_BOLD");
                            tmpReg = (PDFont) fReg.get(null);
                            tmpBold = (PDFont) fBold.get(null);
                        } catch (Exception ex) { }
                        if (tmpReg != null) {
                            fontRegular = tmpReg;
                            fontBold = tmpBold != null ? tmpBold : tmpReg;
                        } else {
                            InputStream is2 = PDType0Font.class.getResourceAsStream("/fonts/DejaVuSans.ttf");
                            if (is2 != null) {
                                fontRegular = PDType0Font.load(doc, is2);
                                fontBold = fontRegular;
                            } else {
                                throw new RuntimeException("No available fonts for PDF generation");
                            }
                        }
                    }

                    cs.setFont(fontBold, 14);
                    cs.newLineAtOffset(40, 750);
                    cs.showText("Bins Report");
                    cs.newLineAtOffset(0, -20);
                    cs.setFont(fontRegular, 10);
                    DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
                    for (Bin b : filtered) {
                        String next = b.getNextCollection() == null ? "" : b.getNextCollection().format(fmt);
                        String line = String.format("%s | %s | %s | %s | %d | %s", b.getBinId(), b.getLocation(), b.getBinType(), b.getOwnerName(), b.getLevel(), next);
                        cs.showText(line);
                        cs.newLineAtOffset(0, -12);
                    }
                    cs.endText();
                }
                doc.save(baos);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bins.pdf");
            return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF).body(baos.toByteArray());
        } catch (Exception ex) {
            ex.printStackTrace();
            String json = "{\"error\":\"internal_error\",\"message\":\"" + (ex.getMessage() == null ? "PDF export failed" : ex.getMessage().replace("\"","\\\"")) + "\"}";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).header(HttpHeaders.CONTENT_TYPE, "application/json").body(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @GetMapping("/types")
    public List<String> types() {
        try {
            return binRepository.findAll().stream().map(b -> b.getBinType()).distinct().collect(Collectors.toList());
        } catch (Exception e) {
            return Arrays.asList("Organic", "Plastic", "Paper", "Metal", "E-waste");
        }
    }

    @GetMapping("/owners")
    public List<String> owners() {
        try {
            return binRepository.findAll().stream().map(b -> b.getOwnerName()).distinct().collect(Collectors.toList());
        } catch (Exception e) {
            return Arrays.asList("CityWorks", "MarketDept", "University", "Harbor");
        }
    }

    // Schedule a collection for a bin (simple setter)
    @org.springframework.web.bind.annotation.PostMapping("/{id}/schedule")
    public Bin schedule(@org.springframework.web.bind.annotation.PathVariable String id, @org.springframework.web.bind.annotation.RequestBody java.util.Map<String,String> body) {
        String scheduledAt = body.get("scheduledAt");
        try {
            java.util.Optional<Bin> maybe = binRepository.findById(id);
            LocalDateTime when = null;
            try { if (scheduledAt != null && !scheduledAt.isBlank()) when = LocalDateTime.parse(scheduledAt); } catch (Exception ex) { /* parse failure */ }
            if (maybe.isPresent()) {
                Bin b = maybe.get();
                b.setNextCollection(when);
                return binRepository.save(b);
            }
            if (when != null) {
                Bin created = Bin.builder().binId(id).location("Unknown location").level(0).binType("Unknown").ownerName("Unknown").nextCollection(when).build();
                return created;
            }
        } catch (Exception e) {
            // ignore and fall through to returning a sample updated object
        }
        // fallback: return a sample bin without nextCollection
        Bin sample = Bin.builder().binId(id).location("Unknown location").level(0).binType("Unknown").ownerName("Unknown").build();
        return sample;
    }
}
