const fs = require("fs");
const Sauce = require("../models/Sauce");

exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject.userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: `${sauce.name} sauce added` }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyingSauce = (req, res) => {
  const filterById = { _id: req.params.id };
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne(filterById).then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message: "Unauthorized request" });
    } else {
      Sauce.updateOne(filterById, { ...sauceObject, _id: req.params.id })
        .then(() =>
          res.status(200).json({ message: `${req.body.name} sauce modified!` })
        )
        .catch((error) => res.status(400).json({ error }));
    }
  });
};

exports.deleteSauce = async (req, res) => {
  const filterById = { _id: req.params.id };
  try {
    const sauce = await Sauce.findOne(filterById);
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message: "Unauthorized request" });
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne(filterById)
          .then(() =>
            res.status(200).json({ message: `${sauce.name} sauce deleted!` })
          )
          .catch((error) => res.status(400).json({ error }));
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.getOneSauce = async (req, res) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    res.status(200).json(sauce);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllSauces = async (req, res) => {
  try {
    const sauces = await Sauce.find();
    res.status(200).json(sauces);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.likeSauce = async (req, res) => {
  const likeStatus = req.body.like;
  const authUserId = req.auth.userId;
  const filterById = { _id: req.params.id };

  const addLike = {
    $inc: { likes: +1 },
    $push: { usersLiked: authUserId },
  };
  const addDislike = {
    $inc: { dislikes: +1 },
    $push: { usersDisliked: authUserId },
  };
  const removeLike = {
    $inc: { likes: -1 },
    $pull: { usersLiked: authUserId },
  };
  const removeDislike = {
    $inc: { dislikes: -1 },
    $pull: { usersDisliked: authUserId },
  };

  try {
    const sauce = await Sauce.findOne(filterById);
    switch (likeStatus) {
      case 1: {
        if (!sauce.usersLiked.includes(authUserId)) {
          await Sauce.findOneAndUpdate(filterById, addLike, { new: true });
          res.status(201).json({ message: `You like ${sauce.name} sauce ` });
        } else {
          return;
        }

        break;
      }
      case -1: {
        if (!sauce.usersDisliked.includes(authUserId)) {
          await Sauce.findOneAndUpdate(filterById, addDislike, { new: true });
          res.status(201).json({ message: `You dislike ${sauce.name} sauce` });
        } else {
          return;
        }

        break;
      }
      case 0: {
        if (sauce.usersLiked.includes(authUserId)) {
          await Sauce.findOneAndUpdate(filterById, removeLike, { new: true });
          res
            .status(201)
            .json({ message: `You removed your like on ${sauce.name}` });
        } else if (sauce.usersDisliked.includes(authUserId)) {
          await Sauce.findOneAndUpdate(filterById, removeDislike, {
            new: true,
          });
          res.status(201).json({
            message: `You removed your dislike on ${sauce.name} sauce`,
          });
        } else {
          return;
        }
        break;
      }
    }
  } catch (error) {
    res.status(400).json(error);
  }
};
