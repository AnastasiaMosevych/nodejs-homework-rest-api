const { HttpError, ctrlWrapper } = require('../../helpers');

const { Contact } = require('../../models/contact');

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 2, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find({ owner }, { skip, limit }).populate("owner", "email");
  res.json({
      status: 'success',
      code: 200,
      data: {
        result
        },
    });
}

const getById = async (req, res) => {
    const { contactId } = req.params;
    const oneContact = await Contact.findById(contactId);
    if (oneContact === null) {
      throw HttpError(404, "Not found");
    }
    res.json({
      status: 'success',
      code: 200,
      data: {
        oneContact
      },
    });
}

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
    res.status(201).json({
      status: 'success',
      code: 201,
      data: {result},
    })
}

const updateById = async (req, res) => {
    const { contactId } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate({ _id: contactId }, req.body, {new: true});
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }
    res.json({ 
      status: 'success',
      code: 200,
      data: {
        updatedContact
      }
    })
}

const updateStatusContact = async (req, res) => {
    const { contactId } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate({ _id: contactId }, req.body, {new: true});
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }
    res.json({ 
      status: 'success',
      code: 200,
      data: {
        updatedContact
      }
    })
}

const remove = async (req, res) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);
    if (!result) {
      throw HttpError(404, "Not found")
    }
    res.json({message: "Contact deleted"})
}

module.exports = {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    updateStatusContact: ctrlWrapper(updateStatusContact),
    remove: ctrlWrapper(remove)
}