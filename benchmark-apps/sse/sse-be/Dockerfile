FROM eclipse-temurin:21-jre

WORKDIR /app

RUN useradd -r -u 1001 appuser
USER appuser

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]