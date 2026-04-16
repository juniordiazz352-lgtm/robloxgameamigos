const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = process.env.PREFIX || '!';

// ✅ Verifica si el usuario es el dueño del servidor
function isOwner(message) {
  return message.guild.ownerId === message.author.id;
}

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 🔒 Verificación de dueño para todos los comandos
  if (!isOwner(message)) {
    return message.reply('❌ Solo el **dueño del servidor** puede usar este comando.');
  }

  // ─────────────────────────────────────────
  // 📢 !say <mensaje>
  // ─────────────────────────────────────────
  if (command === 'say') {
    if (!args.length) {
      return message.reply('❌ Uso correcto: `!say <mensaje>`');
    }
    const texto = args.join(' ');
    await message.delete().catch(() => {});
    await message.channel.send(texto);
  }

  // ─────────────────────────────────────────
  // 🎨 !embed <título> | <descripción> | [color]
  // ─────────────────────────────────────────
  if (command === 'embed') {
    const input = args.join(' ');
    const partes = input.split('|').map((p) => p.trim());

    if (partes.length < 2) {
      return message.reply(
        '❌ Uso correcto: `!embed <título> | <descripción> | [color hex]`\n' +
        'Ejemplo: `!embed Bienvenido | Hola a todos! | #5865F2`'
      );
    }

    const titulo = partes[0];
    const descripcion = partes[1];
    const color = partes[2] ? partes[2] : '#5865F2';

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setFooter({ text: `Enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [embed] });
  }

  // ─────────────────────────────────────────
  // 🧹 !purge <cantidad>
  // ─────────────────────────────────────────
  if (command === 'purge') {
    const cantidad = parseInt(args[0]);

    if (isNaN(cantidad) || cantidad < 1 || cantidad > 100) {
      return message.reply('❌ Uso correcto: `!purge <1-100>`');
    }

    // Verificar que el bot tenga permisos
    if (!message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ No tengo permiso de **Gestionar Mensajes** en este canal.');
    }

    try {
      await message.delete().catch(() => {});
      const deleted = await message.channel.bulkDelete(cantidad, true);
      const aviso = await message.channel.send(`🧹 Se eliminaron **${deleted.size}** mensaje(s).`);
      setTimeout(() => aviso.delete().catch(() => {}), 4000);
    } catch (err) {
      console.error(err);
      message.channel.send('❌ Error al eliminar mensajes. Solo puedo borrar mensajes de menos de 14 días.');
    }
  }
});

client.login(process.env.TOKEN);
const http = require('http');
http.createServer((req, res) => res.end('Bot activo')).listen(3000);
