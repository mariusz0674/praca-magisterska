FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/sse-fe/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
