FROM node:14
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app/dr_odin_reactjs/
RUN npm install
CMD ["npm", "run", "start"]
EXPOSE 7011
