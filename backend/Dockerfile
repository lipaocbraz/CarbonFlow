FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN echo "Building Maven package..." && mvn clean package -DskipTests && ls -la target/

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN ls -la /app/target/ 2>/dev/null || echo "target not found"
COPY --from=builder /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
