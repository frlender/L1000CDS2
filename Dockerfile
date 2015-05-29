FROM library/node:0.10

RUN apt-get update && apt-get install -y npm git

RUN npm install -g bower

WORKDIR /home

EXPOSE 8182

CMD git clone http://readonly:systemsbiology@amp.pharm.mssm.edu/gitlab/apps/Suggest.js.git \
	&& cd Suggest.js\
	&& npm install \
	&& bower install --allow-root \
	&& node index.js
