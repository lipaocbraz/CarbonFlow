package com.carbonflow.exception;

public class ErrorResponse {
    private String message;
    private String field;

    public ErrorResponse(String message, String field) {
        this.message = message;
        this.field = field;
    }

    public ErrorResponse(String message) {
        this.message = message;
        this.field = null;
    }

    public String getMessage(){ 
        return message; 
    }
    public String getField(){ 
        return field; 
    }
}