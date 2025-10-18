package com.csse.smartwaste.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(Environment env) {
        // If spring.mail.host present, let Spring Boot autoconfig normally.
        // Here we create a JavaMailSenderImpl from environment variables when not auto-configured.
        String host = env.getProperty("spring.mail.host", env.getProperty("MAIL_HOST", "localhost"));
        int port = Integer.parseInt(env.getProperty("spring.mail.port", env.getProperty("MAIL_PORT", "25")));
    String username = env.getProperty("spring.mail.username");
    if (username == null) username = env.getProperty("MAIL_USERNAME");
    String password = env.getProperty("spring.mail.password");
    if (password == null) password = env.getProperty("MAIL_PASSWORD");
        String protocol = env.getProperty("spring.mail.protocol", env.getProperty("MAIL_PROTOCOL", "smtp"));

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setProtocol(protocol);
        if (username != null) sender.setUsername(username);
        if (password != null) sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", protocol);
        props.put("mail.smtp.auth", String.valueOf(username != null));
        props.put("mail.smtp.starttls.enable", env.getProperty("spring.mail.properties.mail.smtp.starttls.enable", "true"));
        props.put("mail.debug", env.getProperty("spring.mail.properties.mail.debug", "false"));

        return sender;
    }
}
