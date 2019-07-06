FROM node:11.15.0 as install

# Make ssh dir
RUN mkdir /root/.ssh/

RUN ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts

ADD . /battletris

WORKDIR /battletris

RUN rm -rf node_modules && \
  npm install

CMD ["npm", "start"]
EXPOSE 8080