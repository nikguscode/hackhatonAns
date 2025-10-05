package com.nikguscode.tbankapi.controller.filter;


import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class RedirectFilter implements Filter {
  public static final String GUESTS_PATH = "/api/guests";
  public static final String LOGIN_API_PATH = "/api/login";
  public static final String LOGIN_PATH = "http://127.0.0.1:5501/login.html";

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    Filter.super.init(filterConfig);
  }

  @Override
  public void destroy() {
    Filter.super.destroy();
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
      FilterChain filterChain) throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) servletRequest;
    HttpServletResponse res = (HttpServletResponse) servletResponse;

    String requestUri = req.getRequestURI();

    boolean isGuests = requestUri.startsWith(GUESTS_PATH);
    boolean isLogin = requestUri.startsWith(LOGIN_PATH);
    boolean isLoginApi = requestUri.startsWith(LOGIN_API_PATH);
    boolean isAuthenticated = req.getSession(false) != null;

    if (requestUri.startsWith("/api/") || "OPTIONS".equalsIgnoreCase(req.getMethod())) {
      filterChain.doFilter(servletRequest, servletResponse);
      return;
    }

    if (isGuests || isLogin || isLoginApi || isAuthenticated) {
      filterChain.doFilter(servletRequest, servletResponse);
    } else {
      String scheme = req.getScheme();
      String serverName = req.getServerName();
      int port = req.getServerPort();

      String redirectUrl = scheme + "://" + serverName + ":" + port + LOGIN_PATH;
      res.sendRedirect(redirectUrl);
    }
  }
}