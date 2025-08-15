package com.dic1.projet.hospitalFind.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        // Swagger/OpenAPI (with and without context-path)
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api/swagger-ui.html",
                                "/api/swagger-ui/**",
                                "/api/v3/api-docs/**"
                        ).permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        .requestMatchers("/etablissements/admin/en-attente").permitAll()

                        // Admin listings (explicit root path)
                        .requestMatchers("GET", "/etablissements/admin").hasAuthority("ROLE_ADMIN")

                        .requestMatchers("GET", "/services").permitAll()
                        .requestMatchers("GET", "/services/{id}").permitAll()
                        .requestMatchers("POST", "/services/create").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("DELETE", "/services/{id}/delete").hasAuthority("ROLE_ADMIN")

                        .requestMatchers("GET", "/etablissements").permitAll()
                        .requestMatchers("GET", "/etablissements/{id}").permitAll()

                        .requestMatchers("GET", "/avis/etablissement/**").permitAll()

                        .requestMatchers("/user/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/etablissements/admin/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")

                        .requestMatchers("/tuteur/**").hasAuthority("ROLE_TUTEUR")
                        .requestMatchers("GET", "/tuteur/etablissement").hasAuthority("ROLE_TUTEUR")

                        .requestMatchers("POST", "/avis").hasAnyAuthority("ROLE_STANDARD", "ROLE_TUTEUR", "ROLE_ADMIN")
                        .requestMatchers("PUT", "/avis/**").hasAnyAuthority("ROLE_STANDARD", "ROLE_TUTEUR", "ROLE_ADMIN")
                        .requestMatchers("DELETE", "/avis/**").hasAnyAuthority("ROLE_STANDARD", "ROLE_TUTEUR", "ROLE_ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/api/swagger-ui.html",
                "/api/swagger-ui/**",
                "/api/v3/api-docs/**"
        );
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}