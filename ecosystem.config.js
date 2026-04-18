module.exports = {
  apps: [
    {
      name: "potters-hub",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: ".",
      instances: 1,                   // set to "max" for cluster mode
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "800M",
      env: { NODE_ENV: "production", PORT: 3000 },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
