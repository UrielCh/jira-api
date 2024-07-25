#!/bin/sh
for X in */
do
 cd $X; echo $X
 du -hs .
 find . | wc -l
 cd ..; echo  
done