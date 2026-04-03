broker-up:
	docker compose up -d

broker-down:
	docker compose down

edge-ai:
	cd edge_ai && python main.py

gateway:
	cd gateway && python main.py

dashboard:
	cd admin_dashboard && npm run dev

citizen-app:
	cd citizen_app && npx react-native run-android

install-all:
	cd citizen_app && npm install
	cd admin_dashboard && npm install
	cd edge_ai && pip install -r requirements.txt
	cd gateway && pip install -r requirements.txt
