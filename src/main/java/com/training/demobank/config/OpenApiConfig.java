package com.training.demobank.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI demobankOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info()
                        .title("My Bank API")
                        .description("Banking operations API: Customers, Accounts, Transactions & Transfers")
                        .version("v1")
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0"))
                        .contact(new Contact().name("My Bank Team").email("support@demobank.local")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project README")
                        .url("https://example.com/demobank/readme"));
    }
}
