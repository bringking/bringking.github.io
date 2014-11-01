#! /bin/bash

echo generating rake...
rake generate


echo Please enter change comment

read COMMENT

git commit -m "$COMMENT"

git add .

echo "Push to heroku [y/n]?"

read answer



if [[ $answer = "y" ]]
then
 
git push heroku master

fi
