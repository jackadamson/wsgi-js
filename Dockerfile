FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
