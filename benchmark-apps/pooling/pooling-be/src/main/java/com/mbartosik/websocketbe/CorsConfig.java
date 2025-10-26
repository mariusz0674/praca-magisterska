package com.mbartosik.websocketbe;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*") // lub "*" na szybko, ale nie w prod
                .allowedMethods("GET")                   // wystarczy, bo robisz polling GET
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}