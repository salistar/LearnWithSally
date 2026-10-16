# LearnWithSally — déploiement Hetzner

Le déploiement utilise srv3 (46.225.77.64), choisi après audit des quatre VPS : 372 Go libres, 24 Go de RAM et 12 vCPU au moment du choix. Aucune ressource Render n'est requise.

## Services

- DNS Cloudflare : A learnwithsally.salistar.com vers srv3, DNS only.
- Caddy existant : HTTPS automatique, /api/* et /healthz vers learnwithsally-api:10000, autres chemins vers learnwithsally-web:3100.
- Projet Compose isolé learnwithsally, réseau externe edge, aucun port Docker publié.
- Node/Expo et Python partagent le conteneur API ; Python n'écoute que sur 127.0.0.1:8000.
- Next.js standalone sert le SaaS ; Clerk protège /app et /account.
- Les secrets sont un credential systemd chiffré lié à l'hôte. Le service le matérialise uniquement sous /run (tmpfs), root:root 0600 ; montage en lecture seule dans les conteneurs. Aucun secret dans les images, le dépôt ou les arguments de commande.

## Vérifier

```sh
systemctl is-active learnwithsally
docker ps --filter name=learnwithsally
curl --fail https://learnwithsally.salistar.com/healthz
```

Ne jamais afficher le contenu des credentials, des environnements de processus, ou le fichier /run/learnwithsally/secrets.json.

## Publier une révision suivante

Valider CI, revue du diff, `npm run lint`, `npm run typecheck` et `npm --prefix web run build`. Conserver les images précédentes avec un tag de rollback avant toute reconstruction. Dans /opt/learnwithsally/repository, avancer uniquement vers une révision revue puis construire les deux Dockerfiles avec les seules clés publiques Clerk en build args. Redémarrer les seuls services learnwithsally. Vérifier HTTPS, API et parcours connecté.

## Retour arrière

Pour une révision applicative : réutiliser les images précédemment taguées dans deploy/compose.yml, puis `systemctl restart learnwithsally`. Ne pas supprimer les credentials ni les données des autres applications.

Pour retirer ce premier déploiement : arrêter uniquement `learnwithsally`, restaurer /home/deploy/caddy/Caddyfile.before-learnwithsally dans le fichier Caddy existant en conservant son inode, valider puis recharger Caddy. Retirer uniquement l'enregistrement A LearnWithSally si nécessaire ; conserver les autres enregistrements DNS. Les autres projets ne doivent pas être redémarrés.

## Limites d'exploitation

L'hébergement réutilise un VPS existant ; le calcul Render de 25 USD/mois est abandonné. Stream, OpenAI et Clerk gardent leurs propres quotas et coûts. Aucun nombre maximal d'utilisateurs ou de conversations simultanées n'est garanti : il faut mesurer une charge représentative avant de fixer les quotas commerciaux. Le premier test vocal représente une conversation, pas un benchmark.

La progression est locale au navigateur/appareil ; elle n'est pas synchronisée entre web et mobile. La publication Google Play requiert aussi ses formulaires, sa fiche, les tests imposés par le compte et l'examen Google.
