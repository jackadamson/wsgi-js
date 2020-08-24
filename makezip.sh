#!/bin/bash
mkdir -p example/wheels
cd example/wheels
pip3 wheel --no-binary :all: -r ../requirements.txt
cd ..
zip -r ../public/o/resources.zip *
