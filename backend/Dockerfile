FROM maven:3.9-eclipse-temurin-21
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=0 /app/target/carbonflow-backend-*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
