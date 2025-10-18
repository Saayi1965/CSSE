package com.csse.smartwaste.service;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;

import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {

    @Autowired(required = false)
    private JavaMailSender mailSender; // optional - may be null when SMTP not configured

    public void sendPdf(String to, String subject, String body, byte[] pdfBytes, String filename) throws Exception {
        if (mailSender == null) {
            throw new IllegalStateException("Mail sender is not configured on the server");
        }
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, StandardCharsets.UTF_8.name());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);
        helper.addAttachment(filename, new ByteArrayResource(pdfBytes));
        mailSender.send(msg);
    }

    @Async
    public void sendPdfAsync(String to, String subject, String body, byte[] pdfBytes, String filename) {
        try {
            sendPdf(to, subject, body, pdfBytes, filename);
        } catch (Exception ex) {
            // log and swallow - async execution shouldn't throw to the caller
            ex.printStackTrace();
        }
    }
}
