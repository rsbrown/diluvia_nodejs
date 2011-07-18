set :keep_releases, 3
set :application,  'diluvia'
set :scm,          "git"
# set :git_enable_submodules, 1
set :repository,   'git@rsbrown.unfuddle.com:rsbrown/diluvia.git'
# set :deploy_via,   :export
set :user,         'deploy'
set :use_sudo,     false
set :deploy_subdir, "web"

after "deploy:update_code","deploy:symlink_configs"
after "deploy:update", "deploy:cleanup"
# after "deploy:start", "delayed_job:start"
# after "deploy:stop", "delayed_job:stop"
# after "deploy:restart", "delayed_job:restart"

task :production do
  puts "\n\e[0;31m ######################################################################"
  puts " #\n # Are you REALLY sure you want to deploy to production?"
  puts " #\n # Enter y/N + enter to continue\n #"
  puts " ######################################################################\e[0m\n"
  proceed = STDIN.gets[0..0] rescue nil
  exit unless proceed == 'y' || proceed == 'Y'

  default_run_options[:pty] = true
  set :rails_env, "production"
  set :deploy_to,    "/var/js/diluvia"

  ssh_options[:keys] = [File.join(ENV["HOME"], ".ssh", "aws_rsa")]
  ssh_options[:port] = 38112
  default_environment["PATH"] = "$PATH:$HOME/local/bin/:$HOME/bin"
  role :app, "ec2-184-72-224-221.compute-1.amazonaws.com"
end

namespace(:deploy) do
  task :symlink_configs, :roles => [:app] do
    rails_env = fetch(:rails_env, "development")
    run <<-CMD
      cd #{release_path} &&
      ln -nfs #{shared_path}/config/env.js #{release_path}/server/lib/env.js
      ln -nfs #{shared_path}/system/node_modules #{release_path}/server/node_modules
      ln -nfs #{shared_path}/system/music #{release_path}/server/public/media/music
    CMD
  end

  desc "Restarting node.js with restart.txt"
  task :restart, :roles => :app, :except => { :no_release => true } do
    run <<-CMD
      cd /var/js/diluvia/current/server &&
      ~/local/bin/forever stop app.js && 
      ~/local/bin/forever start app.js
    CMD
  end

  [:start, :stop].each do |t|
    desc "#{t} the node.js server"
    task t, :roles => :app do
      run <<-CMD
        cd /var/js/diluvia/current/server &&
        ~/local/bin/forever #{t} app.js
      CMD
    end
  end

end
