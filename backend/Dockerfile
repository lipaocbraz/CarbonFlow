FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests -X 2>&1 | tail -100

RUN echo "=== Listando arquivos em target ===" && \
    ls -la target/ && \
    echo "=== Procurando JARs ===" && \
    find target -name "*.jar" -type f

RUN JAR_FILE=$(find target -name "*.jar" -type f | grep -v sources | head -1) && \
    if [ -z "$JAR_FILE" ]; then \
      echo "ERRO: Nenhum JAR encontrado em target/"; \
      exit 1; \
    fi && \
    cp "$JAR_FILE" /app/app.jar && \
    echo "JAR copiado: $(ls -lh /app/app.jar)"

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=0 /app/app.jar .

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
