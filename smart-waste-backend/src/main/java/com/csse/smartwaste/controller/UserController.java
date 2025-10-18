package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.model.User;
import com.csse.smartwaste.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import java.io.OutputStreamWriter;
import java.io.ByteArrayOutputStream;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDFont;
import java.io.InputStream;
import java.io.File;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Export CSV (supports optional filtering via query params)
    @GetMapping(value = "/users/export/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestParam(required = false) String role,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String search) {
        try {
            List<User> users = getFilteredUsers(role, status, search);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (OutputStreamWriter writer = new OutputStreamWriter(baos, java.nio.charset.StandardCharsets.UTF_8);
                 CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader("id","username","email","role","status","route","lastLogin"))) {
                for (User u : users) {
                    printer.printRecord(u.getId(), u.getUsername(), u.getEmail(), u.getRole()==null?"":u.getRole().name(), u.getStatus(), u.getRoute(), u.getLastLogin());
                }
            }
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv");
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("text/csv")).body(baos.toByteArray());
        } catch (Exception ex) {
            ex.printStackTrace();
            String json = "{\"error\":\"internal_error\",\"message\":\"" + (ex.getMessage() == null ? "CSV export failed" : ex.getMessage().replace("\"","\\\"")) + "\"}";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).header(HttpHeaders.CONTENT_TYPE, "application/json").body(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    // Export simple PDF report (supports optional filtering)
    @GetMapping(value = "/users/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestParam(required = false) String role,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String search) {
        try {
            List<User> users = getFilteredUsers(role, status, search);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (PDDocument doc = new PDDocument()) {
                PDPage page = new PDPage(PDRectangle.LETTER);
                doc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.beginText();
                    // Try loading common system fonts (Windows)
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
                    } catch (Exception ex) {
                        // ignore font load failure and fallback below
                    }
                    if (regular == null) {
                        try {
                            InputStream is = PDType0Font.class.getResourceAsStream("/fonts/DejaVuSans.ttf");
                            if (is != null) {
                                regular = PDType0Font.load(doc, is);
                            }
                        } catch (Exception ex) {
                            // ignore
                        }
                    }
                    // final fallback to builtin Type1 font if PDType0Font unavailable
                    if (regular == null) {
                        // PDType1Font provides standard 14 fonts; use HELVETICA as fallback
                        // Note: PDType1Font is supported by PDFBox for basic text rendering
                    }
                    if (bold == null) bold = regular;
                    // If PDType0Font wasn't loaded, try to obtain a standard Type1 font via reflection
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
                        } catch (Exception ex) {
                            // reflection failed — we'll try a classpath font below
                        }
                        if (tmpReg != null) {
                            fontRegular = tmpReg;
                            fontBold = tmpBold != null ? tmpBold : tmpReg;
                        } else {
                            // try loading DejaVu from classpath if present
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
                    cs.newLineAtOffset(50, 700);
                    cs.showText("Users Report");
                    cs.newLineAtOffset(0, -20);
                    cs.setFont(fontRegular, 10);
                    for (User u : users) {
                        String line = String.format("%s | %s | %s | %s", u.getId(), u.getUsername(), u.getRole()==null?"":u.getRole().name(), u.getStatus());
                        cs.showText(line);
                        cs.newLineAtOffset(0, -12);
                    }
                    cs.endText();
                }
                doc.save(baos);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.pdf");
            return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF).body(baos.toByteArray());
        } catch (Exception ex) {
            ex.printStackTrace();
            String json = "{\"error\":\"internal_error\",\"message\":\"" + (ex.getMessage() == null ? "PDF export failed" : ex.getMessage().replace("\"","\\\"")) + "\"}";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).header(HttpHeaders.CONTENT_TYPE, "application/json").body(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    // Helper to filter users according to optional params
    private List<User> getFilteredUsers(String role, String status, String search) {
        return userRepository.findAll().stream().filter(u -> {
            if (role != null && !role.isBlank()) {
                String r = u.getRole() == null ? "" : u.getRole().name();
                if (!r.equals(role)) return false;
            }
            if (status != null && !status.isBlank()) {
                String s = u.getStatus() == null ? "" : u.getStatus();
                if (!s.equalsIgnoreCase(status)) return false;
            }
            if (search != null && !search.isBlank()) {
                String s = search.toLowerCase();
                boolean match = (u.getUsername() != null && u.getUsername().toLowerCase().contains(s)) ||
                                (u.getEmail() != null && u.getEmail().toLowerCase().contains(s)) ||
                                (u.getRoute() != null && u.getRoute().toLowerCase().contains(s));
                if (!match) return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    // List users (supports optional server-side filtering via query params)
    @GetMapping("/users")
    public List<Map<String, Object>> listUsers(@RequestParam(required = false) String role,
                                               @RequestParam(required = false) String status,
                                               @RequestParam(required = false) String search) {
        List<User> users;
        if ((role != null && !role.isBlank()) || (status != null && !status.isBlank()) || (search != null && !search.isBlank())) {
            users = getFilteredUsers(role, status, search);
        } else {
            users = userRepository.findAll();
        }
        return users.stream()
                .map(u -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("role", u.getRole() == null ? null : u.getRole().name());
                    m.put("status", u.getStatus() == null ? "Active" : u.getStatus());
                    m.put("route", u.getRoute());
                    m.put("email", u.getEmail());
                    m.put("lastLogin", u.getLastLogin());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // Get single user by id
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        Optional<User> u = userRepository.findById(id);
        if (u.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        User user = u.get();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole() == null ? null : user.getRole().name()
        ));
    }

    // Create new user
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String roleStr = body.get("role");
        String status = body.get("status");
        String route = body.get("route");
        String email = body.get("email");
        String lastLogin = body.get("lastLogin");
        if (username == null || username.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "username required"));

        // simple uniqueness check
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "username exists"));
        }

        Role role = null;
        if (roleStr != null) {
            try { role = Role.valueOf(roleStr); } catch (Exception e) { role = null; }
        }

        User u = new User();
        u.setUsername(username);
        u.setRole(role);
    u.setStatus(status == null ? "Active" : status);
    u.setRoute(route);
    u.setEmail(email);
    u.setLastLogin(lastLogin);
        // no password handling here (would normally be required)
        User saved = userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername(),
                "role", saved.getRole() == null ? null : saved.getRole().name()
        ));
    }

    // Update user
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        User u = opt.get();
        if (body.containsKey("username")) u.setUsername(body.get("username"));
        if (body.containsKey("role")) {
            try { u.setRole(Role.valueOf(body.get("role"))); } catch (Exception e) { /* ignore invalid role */ }
        }
        if (body.containsKey("status")) u.setStatus(body.get("status"));
        if (body.containsKey("route")) u.setRoute(body.get("route"));
        if (body.containsKey("email")) u.setEmail(body.get("email"));
        if (body.containsKey("lastLogin")) u.setLastLogin(body.get("lastLogin"));
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
