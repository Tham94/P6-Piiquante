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
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({ message: "Not authorized" });
    } else {
      Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      )
        .then(() =>
          res.status(200).json({ message: `${req.body.name} sauce modified!` })
        )
        .catch((error) => res.status(400).json({ error }));
    }
  });
};

exports.deleteSauce = async (req, res) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({ message: "Unauthorized user" });
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
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
  const userId = req.body.userId;

  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    switch (likeStatus) {
      case 1: {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: +1 },
            $push: { usersLiked: userId },
          }
        );
        res.status(201).json({ message: `${sauce.name} sauce liked` });

        break;
      }
      case -1: {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: +1 },
            $push: { usersDisliked: userId },
          }
        );
        res.status(201).json({ message: `${sauce.name} sauce disliked` });

        break;
      }
      case 0: {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersliked: userId } }
          );
          res
            .status(201)
            .json({ message: `${sauce.name} sauce to be like/disliked` });
        }

        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } }
          );
          res
            .status(201)
            .json({ message: `${sauce.name} sauce to be like/disliked` });
        }
        break;
      }
    }
  } catch (error) {
    res.status(400).json(error);
  }
};
