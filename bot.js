/* eslint-disable brace-style */
// Require the necessary discord.js classes
const Discord = require('discord.js');
const { token, prefix } = require('./config.json');
const ytdl = require('ytdl-core');


// Create a new client instance
const client = new Discord.Client();
const songQueue = new Map();

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});
client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

/*
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}
}); */

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const serverQueue = songQueue.get(message.guild.id);

	if (message.content.startsWith('${prefix}play')) {
		execute(message, serverQueue);
		return;
	}else if (message.content.startsWith('${prefix}skip')) {
		skip(message, serverQueue);
		return;
	}else if (message.content.startsWith('${prefix}stop')) {
		stop(message, serverQueue);
		return;
	}else if (message.content.startsWith('${prefix}ping')){
		message.channel.send("pong")
	}else{
		message.channel.send("You need to enter a valid command message fail to read")
		message.channel.send(message.content)
		message.channel.send('${prefix}')
	}
});

async function execute(message, serverQueue) {
	const args = message.content.split(" ");
	const voiceChannel = message.member.voice.channel;

	//errors
	if(!voiceChannel){return message.channel.send("Please joing a voice channel to play music!");}
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if(!permissions.has("CONNECT") || !permissions.has("SPEAK")){return message.channel.send(
		"I need permission to join and speak in the voice channel!"
	);}

	//save song obj
	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
	};

	//create the queue contract if it doesn't exist
	if(!serverQueue){
		const queueContract = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};
		//setting the queue using contract
		songQueue.set(message.guild.id,queueContract);
		//pushing song to songs array
		queueContract.songs.push(song);

		//try joining vc
		try{
			var connection = await voiceChannel.join();
			queueContract.connection = connection;
			//play(mess.guild,queueContract.songs[0]);
		} catch(err){ 
			//print error message
			console.log(err);
			songQueue.delete(message.guild.id);
			return message.channel.send(err);
		}

	}else{
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send('${song.title} has been added to the queue');
	}
}

function play(guild, song){
	const serverQueue = queue.get(guild.id);
	//leave channel if no more songs in queue
	if(!song){
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		//next song when current song is done
		.on("finish",() => {
			serverQueue.songs.shift();
			play(guild,serverQueue.songs[0]);
		})
		.on("error", error => console.error(error)); //error event
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send('Currently playing: **${song.title}**');
}

function skip(message,serverQueue) {
	if (!message.member.voice.channel){return message.channel.send(
		"You have to be in a voice channel to skip the music!"
	);}

	if(!serverQueue){return message.channel.send(
		"There is no songs in the queue!"
	);}
	serverQueue.connection.dispatcher.end();
}

function stop(message,serverQueue) {
	if (!message.member.voice.channel){return message.channel.send(
		"You have to be in a voice channel to stop the music!"
	);}

	if(!serverQueue){return message.channel.send(
		"There is no songs in the queue!"
	);}
	serverQueue.songs = []; //clear queue
	serverQueue.connection.dispatcher.end();
}

// Login to Discord with your client's token
client.login(token);
